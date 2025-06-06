import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { useDentists } from '@/hooks/useDentists';
import { useAppointments } from '@/hooks/useAppointments';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'dentist' | 'appointment';
  route: string;
}

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const navigate = useNavigate();
  const { data: patients } = usePatients();
  const { data: dentists } = useDentists();
  const { data: appointments } = useAppointments();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search patients
    patients?.forEach(patient => {
      if (patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.phone.includes(query) ||
          patient.email?.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          id: patient.id,
          title: patient.name,
          subtitle: `Paciente • ${patient.phone}`,
          type: 'patient',
          route: '/pacientes'
        });
      }
    });

    // Search dentists
    dentists?.forEach(dentist => {
      if (dentist.name.toLowerCase().includes(query.toLowerCase()) ||
          dentist.cro.includes(query) ||
          dentist.specialty?.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          id: dentist.id,
          title: dentist.name,
          subtitle: `Dentista • CRO: ${dentist.cro}`,
          type: 'dentist',
          route: '/dentistas'
        });
      }
    });

    // Search appointments
    appointments?.forEach(appointment => {
      const patientName = appointment.patients?.name || 'Paciente não encontrado';
      const dentistName = appointment.dentists?.name || 'Dentista não encontrado';
      
      if (patientName.toLowerCase().includes(query.toLowerCase()) ||
          dentistName.toLowerCase().includes(query.toLowerCase()) ||
          appointment.procedure_type.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          id: appointment.id,
          title: `${appointment.procedure_type}`,
          subtitle: `Agendamento • ${patientName} - ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}`,
          type: 'appointment',
          route: '/agendamentos'
        });
      }
    });

    setResults(searchResults.slice(0, 10));
  }, [query, patients, dentists, appointments]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar pacientes, dentistas, agendamentos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 w-80"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
            <CardContent className="p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="font-medium text-sm">{result.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{result.subtitle}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Nenhum resultado encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
