
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';

export const useAppointmentNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    console.log('Setting up appointment notifications...');

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
      });

    return () => {
      console.log('Cleaning up appointment notifications...');
      supabase.removeChannel(channel);
    };
  }, [addNotification]);
};
