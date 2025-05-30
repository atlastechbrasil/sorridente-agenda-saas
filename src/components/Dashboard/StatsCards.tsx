
import { usePatients } from '@/hooks/usePatients';
import { useDentists } from '@/hooks/useDentists';
import { useAppointments } from '@/hooks/useAppointments';
import StatsCard from './StatsCard';
import { Users, UserCheck, Calendar, CalendarCheck } from 'lucide-react';

export const StatsCards = () => {
  const { data: patients } = usePatients();
  const { data: dentists } = useDentists();
  const { data: appointments } = useAppointments();

  const todayAppointments = appointments?.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today;
  }).length || 0;

  const confirmedAppointments = appointments?.filter(apt => 
    apt.status === 'confirmed'
  ).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total de Pacientes"
        value={String(patients?.length || 0)}
        change="+12%"
        icon={Users}
        trend="up"
      />
      <StatsCard
        title="Dentistas Ativos"
        value={String(dentists?.length || 0)}
        change="+2%"
        icon={UserCheck}
        trend="up"
      />
      <StatsCard
        title="Agendamentos Hoje"
        value={String(todayAppointments)}
        change="+8%"
        icon={Calendar}
        trend="up"
      />
      <StatsCard
        title="Confirmados"
        value={String(confirmedAppointments)}
        change="+15%"
        icon={CalendarCheck}
        trend="up"
      />
    </div>
  );
};
