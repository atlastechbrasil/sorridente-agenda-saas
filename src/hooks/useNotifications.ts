
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, { description: notification.message });
        break;
      case 'error':
        toast.error(notification.title, { description: notification.message });
        break;
      case 'warning':
        toast.warning(notification.title, { description: notification.message });
        break;
      default:
        toast.info(notification.title, { description: notification.message });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for query updates to trigger notifications
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'appointments' && event.type === 'updated') {
        // Check if it's a new appointment creation
        const previousData = event.query.state.data;
        if (previousData && Array.isArray(previousData)) {
          addNotification({
            title: 'Agendamento atualizado',
            message: 'Um agendamento foi criado ou modificado',
            type: 'info'
          });
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Simulate some notifications for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: 'Bem-vindo ao DentalCare Pro',
        message: 'Sistema iniciado com sucesso',
        type: 'success'
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
};
