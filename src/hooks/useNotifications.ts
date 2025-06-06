
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

// Simplified global subscription tracker
let globalChannel: any = null;
let globalUserId: string | null = null;

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      // Cleanup when user logs out
      if (globalChannel) {
        console.log('Cleaning up notifications subscription - user logged out');
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        globalUserId = null;
      }
      setNotifications([]);
      setLoading(false);
      return;
    }

    // If user changed, cleanup old subscription
    if (globalUserId && globalUserId !== user.id && globalChannel) {
      console.log('Cleaning up notifications subscription - user changed');
      supabase.removeChannel(globalChannel);
      globalChannel = null;
      globalUserId = null;
    }

    loadNotifications();
    
    // Only subscribe if not already subscribed for this user
    if (!globalChannel || globalUserId !== user.id) {
      subscribeToNotifications();
    }

    // Cleanup function - only cleanup if we're the last component using this subscription
    return () => {
      // Don't cleanup the global subscription here as other components might be using it
      // The cleanup will happen when user logs out or changes
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

  const subscribeToNotifications = () => {
    if (!user || globalChannel) {
      console.log('Skipping subscription - no user or already subscribed');
      return;
    }

    console.log('Setting up notifications subscription for user:', user.id);
    globalUserId = user.id;

    const channelName = `notifications_${user.id}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          
          const newNotification = payload.new as Notification;
          
          // Update state for all mounted components
          setNotifications(prev => [newNotification, ...prev]);
          
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

          // Add notification to state
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
          
          // Verificar se o status mudou
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

            // Add notification to state
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
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          globalChannel = null;
          globalUserId = null;
        }
      });
    
    globalChannel = channel;
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
