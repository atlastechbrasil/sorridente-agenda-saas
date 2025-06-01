import { useDentists, useDeleteDentist } from '@/hooks/useDentists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { DentistModal } from './DentistModal';

export const DentistsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<any>(null);
  
  const { data: dentists, isLoading, error } = useDentists();
  const deleteDentist = useDeleteDentist();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o dentista ${name}?`)) {
      deleteDentist.mutate(id);
    }
  };

  const handleEdit = (dentist: any) => {
    setSelectedDentist(dentist);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedDentist(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDentist(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dentistas...</div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar dentistas:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar dentistas</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Dentistas</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Dentista
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CRO</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dentists?.map((dentist) => (
                <TableRow key={dentist.id}>
                  <TableCell className="font-medium">{dentist.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dentist.cro}</Badge>
                  </TableCell>
                  <TableCell>{dentist.specialty || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {dentist.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {dentist.phone}
                        </div>
                      )}
                      {dentist.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {dentist.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(dentist)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(dentist.id, dentist.name)}
                        disabled={deleteDentist.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {dentists?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dentista cadastrado
            </div>
          )}
        </CardContent>
      </Card>

      <DentistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        dentist={selectedDentist}
      />
    </>
  );
};
