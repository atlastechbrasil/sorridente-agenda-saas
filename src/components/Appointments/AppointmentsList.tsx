
import { useState, useMemo } from 'react';
import { useAppointments, useDeleteAppointment } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AppointmentModal } from './AppointmentModal';
import { TableFilters } from '@/components/ui/table-filters';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export const AppointmentsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { data: appointments, isLoading, error } = useAppointments();
  const deleteAppointment = useDeleteAppointment();

  const filteredAndSortedAppointments = useMemo(() => {
    if (!appointments) return [];

    let filtered = appointments.filter(appointment => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'patient':
            return appointment.patients?.name?.toLowerCase().includes(value.toLowerCase());
          case 'dentist':
            return appointment.dentists?.name?.toLowerCase().includes(value.toLowerCase());
          case 'procedure_type':
            return appointment.procedure_type.toLowerCase().includes(value.toLowerCase());
          case 'status':
            return appointment.status === value;
          case 'appointment_date':
            return appointment.appointment_date.includes(value);
          default:
            return true;
        }
      });
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case 'patient':
            aValue = a.patients?.name || '';
            bValue = b.patients?.name || '';
            break;
          case 'dentist':
            aValue = a.dentists?.name || '';
            bValue = b.dentists?.name || '';
            break;
          case 'appointment_date':
            aValue = new Date(a.appointment_date + ' ' + a.appointment_time);
            bValue = new Date(b.appointment_date + ' ' + b.appointment_time);
            break;
          default:
            aValue = a[sortColumn as keyof typeof a] || '';
            bValue = b[sortColumn as keyof typeof b] || '';
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [appointments, filters, sortColumn, sortDirection]);

  const filterColumns = [
    { key: 'patient', label: 'Paciente', type: 'text' as const },
    { key: 'dentist', label: 'Dentista', type: 'text' as const },
    { key: 'procedure_type', label: 'Procedimento', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['pending', 'confirmed', 'completed', 'cancelled']
    },
    { key: 'appointment_date', label: 'Data', type: 'date' as const }
  ];

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteAppointment.mutate(id);
    }
  };

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar agendamentos:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar agendamentos</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Agendamentos ({filteredAndSortedAppointments.length})</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TableFilters
            columns={filterColumns}
            onFilter={setFilters}
            onSort={(column, direction) => {
              setSortColumn(column);
              setSortDirection(direction);
            }}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedAppointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.patients?.name || 'Paciente não encontrado'}
                  </TableCell>
                  <TableCell>{appointment.dentists?.name || 'Dentista não encontrado'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {appointment.appointment_time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.procedure_type}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                      {statusLabels[appointment.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
                        disabled={deleteAppointment.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAndSortedAppointments?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {Object.keys(filters).some(key => filters[key]) ? 
                'Nenhum agendamento encontrado com os filtros aplicados' : 
                'Nenhum agendamento encontrado'
              }
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </>
  );
};
