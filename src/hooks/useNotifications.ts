
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

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // Cleanup when user logs out
      cleanup();
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (!isSubscribedRef.current) {
      loadNotifications();
      subscribeToNotifications();
    }

    return cleanup;
  }, [user?.id]);

  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up notifications channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    isSubscribedRef.current = false;
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

  const subscribeToNotifications = () => {
    if (!user || channelRef.current || isSubscribedRef.current) {
      return;
    }

    console.log('Setting up notifications subscription for user:', user.id);
    isSubscribedRef.current = true;

    const channel = supabase
      .channel(`notifications_${user.id}`)
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
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        if (status === 'CLOSED') {
          isSubscribedRef.current = false;
          channelRef.current = null;
        }
      });

    channelRef.current = channel;
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
