
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateProcedure, useUpdateProcedure } from '@/hooks/useProcedures';
import { Tables } from '@/integrations/supabase/types';

type Procedure = Tables<'procedures'>;

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: Procedure | null;
}

interface ProcedureFormData {
  name: string;
  description?: string;
  price: number;
  duration?: number;
}

export const ProcedureModal = ({ isOpen, onClose, procedure }: ProcedureModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProcedureFormData>();

  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();

  useEffect(() => {
    if (isOpen) {
      if (procedure) {
        const formData = {
          name: procedure.name,
          description: procedure.description || '',
          price: procedure.price,
          duration: procedure.duration || 60,
        };
        reset(formData);
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          duration: 60
        });
      }
    }
  }, [isOpen, procedure, reset]);

  const onSubmit = async (data: ProcedureFormData) => {
    try {
      if (procedure) {
        await updateProcedure.mutateAsync({ id: procedure.id, ...data });
      } else {
        await createProcedure.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {procedure ? 'Editar Procedimento' : 'Novo Procedimento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name.message}</span>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Preço é obrigatório',
                  min: { value: 0, message: 'Preço deve ser positivo' }
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-sm">{errors.price.message}</span>
              )}
            </div>
            
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration')}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createProcedure.isPending || updateProcedure.isPending}
            >
              {procedure ? 'Atualizar' : 'Criar'} Procedimento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
