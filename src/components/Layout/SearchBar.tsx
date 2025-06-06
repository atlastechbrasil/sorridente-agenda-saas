
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: dentists, isLoading: dentistsLoading } = useDentists();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    // Wait for data to load before searching
    if (patientsLoading || dentistsLoading || appointmentsLoading) {
      return;
    }

    console.log('Searching for:', query);
    console.log('Available data:', { 
      patients: patients?.length || 0, 
      dentists: dentists?.length || 0, 
      appointments: appointments?.length || 0 
    });

    const searchResults: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search patients
    if (patients && Array.isArray(patients) && patients.length > 0) {
      patients.forEach(patient => {
        if (!patient) return;
        
        const matchesName = patient.name && patient.name.toLowerCase().includes(queryLower);
        const matchesPhone = patient.phone && patient.phone.includes(query);
        const matchesEmail = patient.email && patient.email.toLowerCase().includes(queryLower);
        
        if (matchesName || matchesPhone || matchesEmail) {
          searchResults.push({
            id: patient.id,
            title: patient.name || 'Nome não informado',
            subtitle: `Paciente • ${patient.phone || 'Telefone não informado'}`,
            type: 'patient',
            route: '/pacientes'
          });
        }
      });
    }

    // Search dentists
    if (dentists && Array.isArray(dentists) && dentists.length > 0) {
      dentists.forEach(dentist => {
        if (!dentist) return;
        
        const matchesName = dentist.name && dentist.name.toLowerCase().includes(queryLower);
        const matchesCro = dentist.cro && dentist.cro.toLowerCase().includes(queryLower);
        const matchesSpecialty = dentist.specialty && dentist.specialty.toLowerCase().includes(queryLower);
        
        if (matchesName || matchesCro || matchesSpecialty) {
          searchResults.push({
            id: dentist.id,
            title: dentist.name || 'Nome não informado',
            subtitle: `Dentista • CRO: ${dentist.cro || 'Não informado'}`,
            type: 'dentist',
            route: '/dentistas'
          });
        }
      });
    }

    // Search appointments
    if (appointments && Array.isArray(appointments) && appointments.length > 0) {
      appointments.forEach(appointment => {
        if (!appointment) return;
        
        const patientName = appointment.patients?.name || 'Paciente não encontrado';
        const dentistName = appointment.dentists?.name || 'Dentista não encontrado';
        
        const matchesPatient = patientName.toLowerCase().includes(queryLower);
        const matchesDentist = dentistName.toLowerCase().includes(queryLower);
        const matchesProcedure = appointment.procedure_type && appointment.procedure_type.toLowerCase().includes(queryLower);
        
        if (matchesPatient || matchesDentist || matchesProcedure) {
          searchResults.push({
            id: appointment.id,
            title: `${appointment.procedure_type || 'Procedimento não informado'}`,
            subtitle: `Agendamento • ${patientName} - ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}`,
            type: 'appointment',
            route: '/agendamentos'
          });
        }
      });
    }

    console.log('Search results found:', searchResults.length);
    setResults(searchResults.slice(0, 10));
  }, [query, patients, dentists, appointments, patientsLoading, dentistsLoading, appointmentsLoading]);

  const handleResultClick = (result: SearchResult) => {
    console.log('Navigating to:', result.route);
    navigate(result.route);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const isLoading = patientsLoading || dentistsLoading || appointmentsLoading;

  return (
    <div className="relative w-80" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar pacientes, dentistas, agendamentos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        </div>
      )}
    </div>
  );
};
