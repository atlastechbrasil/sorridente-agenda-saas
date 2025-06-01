
import { useState, useMemo } from 'react';
import { usePatients } from './usePatients';
import { useDentists } from './useDentists';
import { useAppointments } from './useAppointments';

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'dentist' | 'appointment';
  route: string;
};

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: patients } = usePatients();
  const { data: dentists } = useDentists();
  const { data: appointments } = useAppointments();

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search patients
    patients?.forEach(patient => {
      if (patient.name.toLowerCase().includes(term) || 
          patient.phone.includes(term) ||
          patient.email?.toLowerCase().includes(term)) {
        results.push({
          id: patient.id,
          title: patient.name,
          subtitle: patient.phone,
          type: 'patient',
          route: '/pacientes'
        });
      }
    });

    // Search dentists
    dentists?.forEach(dentist => {
      if (dentist.name.toLowerCase().includes(term) ||
          dentist.cro.toLowerCase().includes(term) ||
          dentist.specialty?.toLowerCase().includes(term)) {
        results.push({
          id: dentist.id,
          title: dentist.name,
          subtitle: `CRO: ${dentist.cro}`,
          type: 'dentist',
          route: '/dentistas'
        });
      }
    });

    // Search appointments
    appointments?.forEach(appointment => {
      if (appointment.patients?.name.toLowerCase().includes(term) ||
          appointment.dentists?.name.toLowerCase().includes(term) ||
          appointment.procedure_type.toLowerCase().includes(term)) {
        results.push({
          id: appointment.id,
          title: `${appointment.patients?.name} - ${appointment.procedure_type}`,
          subtitle: `${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às ${appointment.appointment_time}`,
          type: 'appointment',
          route: '/agendamentos'
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, patients, dentists, appointments]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults
  };
};
