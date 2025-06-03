
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patient_name: string;
  dentist_name: string;
  appointment_date: string;
  appointment_time: string;
  procedure_type: string;
  status: string;
  duration: number;
}

interface AppointmentsCalendarProps {
  onAppointmentSelect?: (appointment: Appointment) => void;
}

const AppointmentsCalendar = ({ onAppointmentSelect }: AppointmentsCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (date) {
      filterAppointmentsByDate(date);
    }
  }, [date, appointments]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!appointments_patient_id_fkey(name),
          dentists!appointments_dentist_id_fkey(name)
        `);

      if (error) {
        console.error('Error loading appointments:', error);
        toast.error('Erro ao carregar agendamentos');
        return;
      }

      const formattedAppointments: Appointment[] = data.map(apt => ({
        id: apt.id,
        patient_name: apt.patients?.name || 'Paciente não encontrado',
        dentist_name: apt.dentists?.name || 'Dentista não encontrado',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        procedure_type: apt.procedure_type,
        status: apt.status,
        duration: apt.duration || 60
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointmentsByDate = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dayApps = appointments.filter(apt => apt.appointment_date === dateString);
    setDayAppointments(dayApps);
  };

  const getAppointmentDates = () => {
    return appointments.map(apt => new Date(apt.appointment_date));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'completed':
      case 'concluído':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentSelect) {
      onAppointmentSelect(appointment);
      toast.success(`Agendamento selecionado: ${appointment.procedure_type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              hasAppointment: getAppointmentDates(),
            }}
            modifiersStyles={{
              hasAppointment: {
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos do Dia
            {date && (
              <span className="text-sm font-normal text-gray-500">
                {date.toLocaleDateString('pt-BR')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dayAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {appointment.appointment_time.slice(0, 5)}
                        </span>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.patient_name}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {appointment.procedure_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dr(a). {appointment.dentist_name} • {appointment.duration}min
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsCalendar;
