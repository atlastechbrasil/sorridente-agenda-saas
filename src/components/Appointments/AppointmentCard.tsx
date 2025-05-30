
import { Clock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentCardProps {
  id: string;
  patient: string;
  time: string;
  procedure: string;
  status: "confirmed" | "pending" | "completed";
  phone: string;
}

const AppointmentCard = ({ patient, time, procedure, status, phone }: AppointmentCardProps) => {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800"
  };

  const statusText = {
    confirmed: "Confirmado",
    pending: "Pendente",
    completed: "Concluído"
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{patient}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {statusText[status]}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{phone}</span>
        </div>
        <p className="text-sm text-gray-700">{procedure}</p>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          Editar
        </Button>
        <Button size="sm" variant="outline">
          Contato
        </Button>
      </div>
    </div>
  );
};

export default AppointmentCard;
