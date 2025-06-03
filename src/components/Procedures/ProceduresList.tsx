
import { useState } from 'react';
import { useProcedures, useDeleteProcedure } from '@/hooks/useProcedures';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProcedureModal } from './ProcedureModal';

export const ProceduresList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  
  const { data: procedures, isLoading, error } = useProcedures();
  const deleteProcedure = useDeleteProcedure();

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja desativar este procedimento?')) {
      deleteProcedure.mutate(id);
    }
  };

  const handleEdit = (procedure: any) => {
    setSelectedProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProcedure(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProcedure(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando procedimentos...</div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar procedimentos:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar procedimentos</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Procedimentos</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures?.map((procedure) => (
                <TableRow key={procedure.id}>
                  <TableCell className="font-medium">
                    {procedure.name}
                  </TableCell>
                  <TableCell>
                    {procedure.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      {formatCurrency(procedure.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      {procedure.duration}min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={procedure.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {procedure.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(procedure)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(procedure.id)}
                        disabled={deleteProcedure.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {procedures?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum procedimento encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <ProcedureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        procedure={selectedProcedure}
      />
    </>
  );
};
