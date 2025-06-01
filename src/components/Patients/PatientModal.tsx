
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients';
import { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

interface PatientFormData {
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  address?: string;
  medical_history?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export const PatientModal = ({ isOpen, onClose, patient }: PatientModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: patient ? {
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      birth_date: patient.birth_date || '',
      address: patient.address || '',
      medical_history: patient.medical_history || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
    } : {}
  });

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        await updatePatient.mutateAsync({ id: patient.id, ...data });
      } else {
        await createPatient.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Telefone é obrigatório' })}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">{errors.phone.message}</span>
              )}
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
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                {...register('birth_date')}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              {...register('address')}
            />
          </div>
          
          <div>
            <Label htmlFor="medical_history">Histórico Médico</Label>
            <Input
              id="medical_history"
              {...register('medical_history')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact">Contato de Emergência</Label>
              <Input
                id="emergency_contact"
                {...register('emergency_contact')}
              />
            </div>
            
            <div>
              <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
              <Input
                id="emergency_phone"
                {...register('emergency_phone')}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPatient.isPending || updatePatient.isPending}
            >
              {patient ? 'Atualizar' : 'Criar'} Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
