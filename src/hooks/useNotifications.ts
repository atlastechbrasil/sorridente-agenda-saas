
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

// Global subscription manager to prevent multiple subscriptions
const globalSubscriptionManager = {
  activeSubscriptions: new Map<string, { channel: any; subscribed: boolean }>(),
  
  createSubscription(userId: string, onNotification: (notification: Notification) => void, onAppointment: (payload: any) => void) {
    const channelKey = `notifications_${userId}`;
    
    // If already exists and subscribed, return it
    if (this.activeSubscriptions.has(channelKey)) {
      const existing = this.activeSubscriptions.get(channelKey);
      if (existing?.subscribed) {
        console.log('Reusing existing subscribed channel for user:', userId);
        return existing.channel;
      }
    }

    console.log('Creating new subscription for user:', userId);
    
    const channel = supabase
      .channel(channelKey, { config: { presence: { key: userId } } })
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

    // Store the channel with subscribed = false initially
    this.activeSubscriptions.set(channelKey, { channel, subscribed: false });
    
    // Subscribe and update the subscribed status
    channel.subscribe((status: string) => {
      console.log('Channel subscription status:', status);
      const subscription = this.activeSubscriptions.get(channelKey);
      if (subscription) {
        if (status === 'SUBSCRIBED') {
          subscription.subscribed = true;
          console.log('Successfully subscribed to notifications channel');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          subscription.subscribed = false;
          console.log('Channel closed or error occurred');
        }
      }
    });

    return channel;
  },

  removeSubscription(userId: string) {
    const channelKey = `notifications_${userId}`;
    const subscription = this.activeSubscriptions.get(channelKey);
    
    if (subscription) {
      console.log('Removing subscription for user:', userId);
      supabase.removeChannel(subscription.channel);
      this.activeSubscriptions.delete(channelKey);
    }
  },

  cleanup() {
    console.log('Cleaning up all subscriptions');
    this.activeSubscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription.channel);
    });
    this.activeSubscriptions.clear();
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      
      // Clean up previous subscriptions if user logged out
      if (currentUserIdRef.current) {
        globalSubscriptionManager.removeSubscription(currentUserIdRef.current);
        currentUserIdRef.current = null;
        isSetupRef.current = false;
      }
      return;
    }

    // If user changed, clean up previous subscription
    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      globalSubscriptionManager.removeSubscription(currentUserIdRef.current);
      isSetupRef.current = false;
    }

    currentUserIdRef.current = user.id;
    loadNotifications();

    // Setup subscription only once per user
    if (!isSetupRef.current) {
      setupRealtimeSubscription();
      isSetupRef.current = true;
    }
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentUserIdRef.current) {
        globalSubscriptionManager.removeSubscription(currentUserIdRef.current);
        isSetupRef.current = false;
      }
    };
  }, []);

  const setupRealtimeSubscription = () => {
    if (!user) return;

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

    globalSubscriptionManager.createSubscription(user.id, handleNotification, handleAppointment);
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
