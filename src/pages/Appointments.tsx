
import { Plus, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import AppointmentCard from "@/components/Appointments/AppointmentCard";

const Appointments = () => {
  const appointments = [
    {
      id: "1",
      patient: "Maria Silva",
      time: "09:00",
      procedure: "Limpeza e Profilaxia",
      status: "confirmed" as const,
      phone: "(11) 99999-9999"
    },
    {
      id: "2",
      patient: "João Santos",
      time: "10:30",
      procedure: "Consulta de Rotina",
      status: "pending" as const,
      phone: "(11) 88888-8888"
    },
    {
      id: "3",
      patient: "Ana Costa",
      time: "14:00",
      procedure: "Tratamento de Canal",
      status: "confirmed" as const,
      phone: "(11) 77777-7777"
    },
    {
      id: "4",
      patient: "Carlos Oliveira",
      time: "15:30",
      procedure: "Extração",
      status: "completed" as const,
      phone: "(11) 66666-6666"
    },
    {
      id: "5",
      patient: "Lucia Ferreira",
      time: "16:00",
      procedure: "Consulta Ortodôntica",
      status: "pending" as const,
      phone: "(11) 55555-5555"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamentos</h1>
              <p className="text-gray-600">Gerencie todos os agendamentos da clínica</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendário
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button className="px-4 py-2 bg-white text-blue-600 rounded-md shadow-sm font-medium">
              Hoje
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-md transition-colors">
              Semana
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-md transition-colors">
              Mês
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-white rounded-md transition-colors">
              Todos
            </button>
          </div>

          {/* Appointments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} {...appointment} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
