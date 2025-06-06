
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
const channelManager = {
  activeChannel: null as any,
  currentUserId: null as string | null,
  
  cleanup() {
    if (this.activeChannel) {
      console.log('Cleaning up global channel');
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
      this.currentUserId = null;
    }
  },
  
  createChannel(userId: string, callbacks: any) {
    // If we already have a channel for this user, return it
    if (this.activeChannel && this.currentUserId === userId) {
      console.log('Reusing existing channel for user:', userId);
      return this.activeChannel;
    }
    
    // Cleanup any existing channel
    this.cleanup();
    
    console.log('Creating new channel for user:', userId);
    this.currentUserId = userId;
    
    const channelName = `notifications_${userId}_${Date.now()}`;
    this.activeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callbacks.onNotification
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        callbacks.onAppointmentCreate
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        callbacks.onAppointmentUpdate
      );

    this.activeChannel.subscribe((status: string) => {
      console.log('Global channel subscription status:', status);
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        this.cleanup();
      }
    });

    return this.activeChannel;
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const subscribedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      subscribedRef.current = false;
      return;
    }

    loadNotifications();
    
    // Only setup subscription if not already subscribed for this user
    if (!subscribedRef.current) {
      setupRealtimeSubscription();
      subscribedRef.current = true;
    }

    return () => {
      subscribedRef.current = false;
    };
  }, [user?.id]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      channelManager.cleanup();
    };
  }, []);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const callbacks = {
      onNotification: (payload: any) => {
        console.log('New notification received:', payload);
        
        if (!mountedRef.current) return;
        
        const newNotification = payload.new as Notification;
        
        setNotifications(prev => [newNotification, ...prev]);
        
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
      },
      
      onAppointmentCreate: (payload: any) => {
        console.log('New appointment created:', payload);
        
        if (!mountedRef.current) return;
        
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
      },
      
      onAppointmentUpdate: (payload: any) => {
        console.log('Appointment updated:', payload);
        
        if (!mountedRef.current) return;
        
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
      }
    };

    channelManager.createChannel(user.id, callbacks);
  };

  const loadNotifications = async () => {
    if (!user || !mountedRef.current) return;

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

      if (!mountedRef.current) return;

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
      if (mountedRef.current) {
        setLoading(false);
      }
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

      if (mountedRef.current) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      }
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

      if (mountedRef.current) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
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

      if (mountedRef.current) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
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
