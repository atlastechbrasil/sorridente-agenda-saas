
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { StatsCards } from "@/components/Dashboard/StatsCards";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Visão geral da clínica dental</p>
            </div>
            
            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Próximos Agendamentos</h2>
                <p className="text-gray-600">Lista dos próximos agendamentos será exibida aqui</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                <p className="text-gray-600">Atividades recentes da clínica serão exibidas aqui</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
