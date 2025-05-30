
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import PatientCard from "@/components/Patients/PatientCard";

const Patients = () => {
  const patients = [
    {
      id: "1",
      name: "Maria Silva",
      phone: "(11) 99999-9999",
      email: "maria.silva@email.com",
      lastVisit: "15/03/2024",
      nextAppointment: "22/03/2024"
    },
    {
      id: "2",
      name: "João Santos",
      phone: "(11) 88888-8888",
      email: "joao.santos@email.com",
      lastVisit: "10/03/2024"
    },
    {
      id: "3",
      name: "Ana Costa",
      phone: "(11) 77777-7777",
      email: "ana.costa@email.com",
      lastVisit: "08/03/2024",
      nextAppointment: "20/03/2024"
    },
    {
      id: "4",
      name: "Carlos Oliveira",
      phone: "(11) 66666-6666",
      email: "carlos.oliveira@email.com",
      lastVisit: "05/03/2024"
    },
    {
      id: "5",
      name: "Lucia Ferreira",
      phone: "(11) 55555-5555",
      email: "lucia.ferreira@email.com",
      lastVisit: "01/03/2024"
    },
    {
      id: "6",
      name: "Pedro Lima",
      phone: "(11) 44444-4444",
      email: "pedro.lima@email.com",
      lastVisit: "28/02/2024",
      nextAppointment: "25/03/2024"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pacientes</h1>
              <p className="text-gray-600">Gerencie todos os pacientes da clínica</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar pacientes..." 
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <option>Todos os pacientes</option>
              <option>Com consulta agendada</option>
              <option>Sem consulta agendada</option>
              <option>Novos pacientes</option>
            </select>
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard key={patient.id} {...patient} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Patients;
