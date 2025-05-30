
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import StatsCard from "@/components/Dashboard/StatsCard";
import AppointmentCard from "@/components/Appointments/AppointmentCard";

const Dashboard = () => {
  const todayAppointments = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Consultas Hoje"
              value="12"
              change="+2 em relação a ontem"
              icon={Calendar}
              trend="up"
            />
            <StatsCard
              title="Total de Pacientes"
              value="324"
              change="+8 este mês"
              icon={Users}
              trend="up"
            />
            <StatsCard
              title="Horas Trabalhadas"
              value="7.5h"
              change="Meta: 8h"
              icon={Clock}
              trend="down"
            />
            <StatsCard
              title="Receita Mensal"
              value="R$ 25.400"
              change="+12% vs mês anterior"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Today's Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Agendamentos de Hoje
                </h2>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} {...appointment} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações Rápidas
                </h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Novo Agendamento
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Cadastrar Paciente
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Ver Relatórios
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lembretes
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="font-medium text-yellow-800">Confirmação Pendente</p>
                    <p>3 consultas precisam de confirmação</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="font-medium text-blue-800">Aniversários</p>
                    <p>2 pacientes fazem aniversário hoje</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
