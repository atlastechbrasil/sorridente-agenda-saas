
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateDentist, useUpdateDentist } from '@/hooks/useDentists';
import { Tables } from '@/integrations/supabase/types';

type Dentist = Tables<'dentists'>;

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist?: Dentist | null;
}

interface DentistFormData {
  name: string;
  cro: string;
  email?: string;
  phone?: string;
  specialty?: string;
}

export const DentistModal = ({ isOpen, onClose, dentist }: DentistModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DentistFormData>({
    defaultValues: dentist ? {
      name: dentist.name,
      cro: dentist.cro,
      email: dentist.email || '',
      phone: dentist.phone || '',
      specialty: dentist.specialty || '',
    } : {}
  });

  const createDentist = useCreateDentist();
  const updateDentist = useUpdateDentist();

  const onSubmit = async (data: DentistFormData) => {
    try {
      if (dentist) {
        await updateDentist.mutateAsync({ id: dentist.id, ...data });
      } else {
        await createDentist.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar dentista:', error);
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
            {dentist ? 'Editar Dentista' : 'Novo Dentista'}
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
            <Label htmlFor="cro">CRO *</Label>
            <Input
              id="cro"
              {...register('cro', { required: 'CRO é obrigatório' })}
            />
            {errors.cro && (
              <span className="text-red-500 text-sm">{errors.cro.message}</span>
            )}
          </div>
          
          <div>
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              {...register('specialty')}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createDentist.isPending || updateDentist.isPending}
            >
              {dentist ? 'Atualizar' : 'Criar'} Dentista
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
