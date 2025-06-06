
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';

export const useAppointmentNotifications = () => {
  const { addNotification } = useNotifications();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!isSubscribedRef.current) {
      setupAppointmentNotifications();
    }

    return cleanup;
  }, [addNotification]);

  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up appointment notifications...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  };

  const setupAppointmentNotifications = () => {
    if (isSubscribedRef.current) {
      console.log('Appointment notifications already set up');
      return;
    }

    console.log('Setting up appointment notifications...');
    isSubscribedRef.current = true;

    const channel = supabase
      .channel('appointment_changes')
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

          addNotification({
            title: 'Novo Agendamento',
            message: `Um novo agendamento foi criado para ${payload.new.appointment_date} às ${payload.new.appointment_time}`,
            type: 'info'
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

            addNotification({
              title: 'Agendamento Atualizado',
              message: `Status do agendamento alterado para: ${statusLabels[payload.new.status as keyof typeof statusLabels]}`,
              type: 'info'
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Appointment notifications subscription status:', status);
        if (status === 'CLOSED') {
          isSubscribedRef.current = false;
          channelRef.current = null;
        }
      });

    channelRef.current = channel;
  };
};
