
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
}

// Global channel manager to prevent multiple subscriptions
const globalChannelManager = {
  activeChannels: new Map<string, any>(),
  
  getOrCreateChannel(userId: string, onNotification: (notification: Notification) => void, onAppointment: (payload: any) => void) {
    const channelKey = `notifications_${userId}`;
    
    if (this.activeChannels.has(channelKey)) {
      return this.activeChannels.get(channelKey);
    }

    console.log('Creating new channel for user:', userId);
    
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          onNotification(newNotification);
          
          // Show toast
          switch (newNotification.type) {
            case 'success':
              toast.success(newNotification.title, { description: newNotification.message });
              break;
            case 'error':
              toast.error(newNotification.title, { description: newNotification.message });
              break;
            case 'warning':
              toast.warning(newNotification.title, { description: newNotification.message });
              break;
            default:
              toast.info(newNotification.title, { description: newNotification.message });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('New appointment created:', payload);
          onAppointment(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment updated:', payload);
          onAppointment(payload);
        }
      );

    this.activeChannels.set(channelKey, channel);
    return channel;
  },

  removeChannel(userId: string) {
    const channelKey = `notifications_${userId}`;
    const channel = this.activeChannels.get(channelKey);
    
    if (channel) {
      console.log('Removing channel for user:', userId);
      supabase.removeChannel(channel);
      this.activeChannels.delete(channelKey);
    }
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const subscribedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      
      // Clean up previous subscriptions if user logged out
      if (currentUserIdRef.current) {
        globalChannelManager.removeChannel(currentUserIdRef.current);
        currentUserIdRef.current = null;
        subscribedRef.current = false;
      }
      return;
    }

    // If user changed, clean up previous subscription
    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      globalChannelManager.removeChannel(currentUserIdRef.current);
      subscribedRef.current = false;
    }

    currentUserIdRef.current = user.id;
    loadNotifications();

    // Setup subscription only if not already subscribed for this user
    if (!subscribedRef.current) {
      setupRealtimeSubscription();
    }

    return () => {
      // Don't cleanup on every effect run, only on unmount
    };
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentUserIdRef.current) {
        globalChannelManager.removeChannel(currentUserIdRef.current);
        subscribedRef.current = false;
      }
    };
  }, []);

  const setupRealtimeSubscription = () => {
    if (!user || subscribedRef.current) return;

    console.log('Setting up realtime subscription for user:', user.id);

    const handleNotification = (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleAppointment = (payload: any) => {
      if (payload.new && payload.old) {
        // Update event
        if (payload.old.status !== payload.new.status) {
          const statusLabels = {
            pending: 'Pendente',
            confirmed: 'Confirmado',
            completed: 'Concluído',
            cancelled: 'Cancelado'
          };

          toast.info('Agendamento atualizado!', {
            description: `Status alterado para: ${statusLabels[payload.new.status as keyof typeof statusLabels]}`
          });

          const appointmentUpdateNotification = {
            id: `appointment_update_${payload.new.id}`,
            title: 'Agendamento Atualizado',
            message: `Status do agendamento alterado para: ${statusLabels[payload.new.status as keyof typeof statusLabels]}`,
            type: 'info' as const,
            created_at: new Date().toISOString(),
            read: false
          };

          setNotifications(prev => [appointmentUpdateNotification, ...prev]);
        }
      } else if (payload.new) {
        // Insert event
        toast.success('Novo agendamento criado!', {
          description: `Agendamento para ${payload.new.appointment_date} às ${payload.new.appointment_time}`
        });

        const appointmentNotification = {
          id: `appointment_${payload.new.id}`,
          title: 'Novo Agendamento',
          message: `Um novo agendamento foi criado para ${payload.new.appointment_date} às ${payload.new.appointment_time}`,
          type: 'info' as const,
          created_at: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [appointmentNotification, ...prev]);
      }
    };

    const channel = globalChannelManager.getOrCreateChannel(user.id, handleNotification, handleAppointment);

    channel.subscribe((status: string) => {
      console.log('Channel subscription status:', status);
      if (status === 'SUBSCRIBED') {
        subscribedRef.current = true;
        console.log('Successfully subscribed to notifications channel');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        subscribedRef.current = false;
        console.log('Channel closed or error occurred');
      }
    });
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      const formattedNotifications: Notification[] = data?.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as 'info' | 'success' | 'warning' | 'error',
        created_at: notification.created_at || '',
        read: notification.read || false
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type
        });

      if (error) {
        console.error('Error adding notification:', error);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadNotifications
  };
};
