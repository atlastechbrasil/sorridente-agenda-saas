
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  patient_name: string;
  dentist_name: string;
  appointment_date: string;
  appointment_time: string;
  procedure_type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
};

export const AppointmentsCalendar = ({ appointments, onAppointmentClick }: AppointmentsCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const hasAppointments = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.some(apt => apt.appointment_date === dateString);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-md border"
            modifiers={{
              hasAppointments: (date) => hasAppointments(date)
            }}
            modifiersStyles={{
              hasAppointments: {
                backgroundColor: 'rgb(59 130 246 / 0.1)',
                color: 'rgb(59 130 246)',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento para esta data
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.appointment_time}</span>
                    </div>
                    <Badge className={statusColors[appointment.status]}>
                      {appointment.status === 'pending' && 'Pendente'}
                      {appointment.status === 'confirmed' && 'Confirmado'}
                      {appointment.status === 'completed' && 'Concluído'}
                      {appointment.status === 'cancelled' && 'Cancelado'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{appointment.patient_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dr. {appointment.dentist_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.procedure_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
