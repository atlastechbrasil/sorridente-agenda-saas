
import { useState, useMemo } from 'react';
import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PatientModal } from './PatientModal';
import { TableFilters } from '@/components/ui/table-filters';

export const PatientsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { data: patients, isLoading, error } = usePatients();
  const deletePatient = useDeletePatient();

  const filteredAndSortedPatients = useMemo(() => {
    if (!patients) return [];

    let filtered = patients.filter(patient => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'name':
            return patient.name.toLowerCase().includes(value.toLowerCase());
          case 'email':
            return patient.email?.toLowerCase().includes(value.toLowerCase());
          case 'phone':
            return patient.phone.includes(value);
          case 'birth_date':
            return patient.birth_date?.includes(value);
          default:
            return true;
        }
      });
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn as keyof typeof a];
        let bValue = b[sortColumn as keyof typeof b];

        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

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
  }, [patients, filters, sortColumn, sortDirection]);

  const filterColumns = [
    { key: 'name', label: 'Nome', type: 'text' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'phone', label: 'Telefone', type: 'text' as const },
    { key: 'birth_date', label: 'Data de Nascimento', type: 'date' as const }
  ];

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o paciente ${name}?`)) {
      deletePatient.mutate(id);
    }
  };

  const handleEdit = (patient: any) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando pacientes...</div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar pacientes:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar pacientes</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pacientes ({filteredAndSortedPatients.length})</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
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
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPatients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(patient.id, patient.name)}
                        disabled={deletePatient.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAndSortedPatients?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {Object.keys(filters).some(key => filters[key]) ? 
                'Nenhum paciente encontrado com os filtros aplicados' : 
                'Nenhum paciente cadastrado'
              }
            </div>
          )}
        </CardContent>
      </Card>

      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </>
  );
};
