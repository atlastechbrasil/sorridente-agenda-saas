
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
        value={patients?.length || 0}
        icon={Users}
        trend="+12%"
        trendUp={true}
      />
      <StatsCard
        title="Dentistas Ativos"
        value={dentists?.length || 0}
        icon={UserCheck}
        trend="+2%"
        trendUp={true}
      />
      <StatsCard
        title="Agendamentos Hoje"
        value={todayAppointments}
        icon={Calendar}
        trend="+8%"
        trendUp={true}
      />
      <StatsCard
        title="Confirmados"
        value={confirmedAppointments}
        icon={CalendarCheck}
        trend="+15%"
        trendUp={true}
      />
    </div>
  );
};
