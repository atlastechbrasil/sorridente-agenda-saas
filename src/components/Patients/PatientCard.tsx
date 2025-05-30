
import { User, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientCardProps {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment?: string;
}

const PatientCard = ({ name, phone, email, lastVisit, nextAppointment }: PatientCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">Paciente</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Última visita: {lastVisit}</span>
        </div>
        {nextAppointment && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Próxima consulta: {nextAppointment}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button size="sm" className="flex-1">
          Ver Prontuário
        </Button>
        <Button size="sm" variant="outline">
          Agendar
        </Button>
      </div>
    </div>
  );
};

export default PatientCard;
