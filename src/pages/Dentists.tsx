
import { Plus, Filter, UserCheck, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

const Dentists = () => {
  const dentists = [
    {
      id: "1",
      name: "Dr. Roberto Silva",
      specialty: "Ortodontia",
      cro: "CRO-SP 12345",
      phone: "(11) 99999-0001",
      email: "roberto.silva@clinica.com",
      todayAppointments: 8,
      rating: 4.9,
      status: "available"
    },
    {
      id: "2",
      name: "Dra. Ana Martins",
      specialty: "Endodontia",
      cro: "CRO-SP 67890",
      phone: "(11) 99999-0002",
      email: "ana.martins@clinica.com",
      todayAppointments: 6,
      rating: 4.8,
      status: "busy"
    },
    {
      id: "3",
      name: "Dr. Carlos Ferreira",
      specialty: "Cirurgia Oral",
      cro: "CRO-SP 54321",
      phone: "(11) 99999-0003",
      email: "carlos.ferreira@clinica.com",
      todayAppointments: 4,
      rating: 4.7,
      status: "available"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "busy":
        return "Ocupado";
      case "offline":
        return "Offline";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dentistas</h1>
              <p className="text-gray-600">Gerencie a equipe de profissionais da clínica</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Dentista
              </Button>
            </div>
          </div>

          {/* Dentists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dentists.map((dentist) => (
              <div key={dentist.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dentist.name}</h3>
                      <p className="text-sm text-gray-500">{dentist.specialty}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dentist.status)}`}>
                    {getStatusText(dentist.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">CRO:</span>
                    <span className="ml-2 text-gray-700">{dentist.cro}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Telefone:</span>
                    <span className="ml-2 text-gray-700">{dentist.phone}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-700">{dentist.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{dentist.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{dentist.todayAppointments} consultas hoje</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    Ver Agenda
                  </Button>
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dentists;
