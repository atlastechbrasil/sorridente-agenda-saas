
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List } from 'lucide-react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { AppointmentsList } from "@/components/Appointments/AppointmentsList";
import AppointmentsCalendar from "@/components/Appointments/AppointmentsCalendar";
import { useAppointmentNotifications } from "@/hooks/useAppointmentNotifications";

const Appointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Ativar notificações de agendamento
  useAppointmentNotifications();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAppointmentSelect = (appointment: any) => {
    setSelectedAppointment(appointment);
    console.log('Selected appointment:', appointment);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gerencie os agendamentos da clínica
              </p>
            </div>
            
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendário
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <AppointmentsList />
              </TabsContent>
              
              <TabsContent value="calendar">
                <AppointmentsCalendar onAppointmentSelect={handleAppointmentSelect} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
