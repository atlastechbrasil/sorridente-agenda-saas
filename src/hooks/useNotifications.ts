
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

// Global subscription management
class NotificationSubscriptionManager {
  private static instance: NotificationSubscriptionManager;
  private channel: any = null;
  private currentUserId: string | null = null;
  private subscribers = new Set<(notifications: Notification[]) => void>();

  static getInstance(): NotificationSubscriptionManager {
    if (!NotificationSubscriptionManager.instance) {
      NotificationSubscriptionManager.instance = new NotificationSubscriptionManager();
    }
    return NotificationSubscriptionManager.instance;
  }

  subscribe(userId: string, callback: (notifications: Notification[]) => void) {
    this.subscribers.add(callback);
    
    if (this.currentUserId !== userId) {
      this.cleanup();
      this.currentUserId = userId;
      this.setupChannel(userId);
    }
  }

  unsubscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.delete(callback);
    
    if (this.subscribers.size === 0) {
      this.cleanup();
    }
  }

  private setupChannel(userId: string) {
    if (this.channel) return;

    console.log('Setting up notifications subscription for user:', userId);
    
    const channelName = `notifications_${userId}_${Date.now()}`;
    this.channel = supabase
      .channel(channelName)
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
          
          // Notify all subscribers
          this.subscribers.forEach(callback => {
            callback([newNotification]);
          });
          
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

          this.subscribers.forEach(callback => {
            callback([appointmentNotification]);
          });
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

            this.subscribers.forEach(callback => {
              callback([appointmentUpdateNotification]);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.cleanup();
        }
      });
  }

  private cleanup() {
    if (this.channel) {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.currentUserId = null;
    }
  }

  cleanupForUser(userId: string) {
    if (this.currentUserId === userId) {
      this.cleanup();
    }
  }
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const subscriptionManager = NotificationSubscriptionManager.getInstance();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      subscriptionManager.cleanupForUser(user?.id || '');
      setNotifications([]);
      setLoading(false);
      return;
    }

    loadNotifications();
    
    // Subscribe to real-time updates
    const handleNewNotifications = (newNotifications: Notification[]) => {
      if (!mountedRef.current) return;
      
      setNotifications(prev => [...newNotifications, ...prev]);
    };

    subscriptionManager.subscribe(user.id, handleNewNotifications);

    return () => {
      subscriptionManager.unsubscribe(handleNewNotifications);
    };
  }, [user?.id]);

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
