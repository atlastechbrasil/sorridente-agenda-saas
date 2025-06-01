
import { useState } from 'react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { AppointmentsList } from "@/components/Appointments/AppointmentsList";
import { AppointmentsCalendar } from "@/components/Appointments/AppointmentsCalendar";
import { Button } from '@/components/ui/button';
import { Calendar, List } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock data para demonstração
const mockAppointments = [
  {
    id: '1',
    patient_name: 'João Silva',
    dentist_name: 'Dr. Santos',
    appointment_date: '2024-12-01',
    appointment_time: '09:00',
    procedure_type: 'Limpeza',
    status: 'confirmed' as const
  },
  {
    id: '2',
    patient_name: 'Maria Santos',
    dentist_name: 'Dr. Silva',
    appointment_date: '2024-12-01',
    appointment_time: '14:30',
    procedure_type: 'Restauração',
    status: 'pending' as const
  },
  {
    id: '3',
    patient_name: 'Pedro Costa',
    dentist_name: 'Dr. Santos',
    appointment_date: '2024-12-02',
    appointment_time: '10:00',
    procedure_type: 'Canal',
    status: 'confirmed' as const
  }
];

const Appointments = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleAppointmentClick = (appointment: any) => {
    // Aqui você pode implementar a navegação para a tela de edição
    console.log('Clicked appointment:', appointment);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie os agendamentos da clínica</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    onClick={() => setViewMode('calendar')}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Calendário
                  </Button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <AppointmentsList />
              ) : (
                <AppointmentsCalendar 
                  appointments={mockAppointments}
                  onAppointmentClick={handleAppointmentClick}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Appointments;
