
import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const PatientsList = () => {
  const { data: patients, isLoading, error } = usePatients();
  const deletePatient = useDeletePatient();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o paciente ${name}?`)) {
      deletePatient.mutate(id);
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Pacientes</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            {patients?.map((patient) => (
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
                    <Button variant="outline" size="sm">
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
        {patients?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum paciente cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
