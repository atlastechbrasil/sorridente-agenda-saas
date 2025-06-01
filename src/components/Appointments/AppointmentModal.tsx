
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDentists } from '@/hooks/useDentists';
import { Tables } from '@/integrations/supabase/types';

type Appointment = Tables<'appointments'> & {
  patients?: Tables<'patients'>;
  dentists?: Tables<'dentists'>;
};

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

interface AppointmentFormData {
  patient_id: string;
  dentist_id: string;
  appointment_date: string;
  appointment_time: string;
  procedure_type: string;
  duration?: number;
  notes?: string;
  status: string;
}

export const AppointmentModal = ({ isOpen, onClose, appointment }: AppointmentModalProps) => {
  const { data: patients } = usePatients();
  const { data: dentists } = useDentists();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentFormData>();

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  // Reset form with appointment data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        const formData = {
          patient_id: appointment.patient_id,
          dentist_id: appointment.dentist_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          procedure_type: appointment.procedure_type,
          duration: appointment.duration || 60,
          notes: appointment.notes || '',
          status: appointment.status,
        };
        
        reset(formData);
        setSelectedPatient(appointment.patient_id);
        setSelectedDentist(appointment.dentist_id);
        setSelectedStatus(appointment.status);
      } else {
        reset({
          patient_id: '',
          dentist_id: '',
          appointment_date: '',
          appointment_time: '',
          procedure_type: '',
          duration: 60,
          notes: '',
          status: 'pending'
        });
        setSelectedPatient('');
        setSelectedDentist('');
        setSelectedStatus('pending');
      }
    }
  }, [isOpen, appointment, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const formData = {
        ...data,
        patient_id: selectedPatient,
        dentist_id: selectedDentist,
        status: selectedStatus,
      };

      if (appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, ...formData });
      } else {
        await createAppointment.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedPatient('');
    setSelectedDentist('');
    setSelectedStatus('pending');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dentist_id">Dentista *</Label>
              <Select value={selectedDentist} onValueChange={setSelectedDentist}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentists?.map((dentist) => (
                    <SelectItem key={dentist.id} value={dentist.id}>
                      {dentist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment_date">Data *</Label>
              <Input
                id="appointment_date"
                type="date"
                {...register('appointment_date', { required: 'Data é obrigatória' })}
              />
              {errors.appointment_date && (
                <span className="text-red-500 text-sm">{errors.appointment_date.message}</span>
              )}
            </div>
            
            <div>
              <Label htmlFor="appointment_time">Horário *</Label>
              <Input
                id="appointment_time"
                type="time"
                {...register('appointment_time', { required: 'Horário é obrigatório' })}
              />
              {errors.appointment_time && (
                <span className="text-red-500 text-sm">{errors.appointment_time.message}</span>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="procedure_type">Tipo de Procedimento *</Label>
            <Input
              id="procedure_type"
              {...register('procedure_type', { required: 'Tipo de procedimento é obrigatório' })}
            />
            {errors.procedure_type && (
              <span className="text-red-500 text-sm">{errors.procedure_type.message}</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration')}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              {...register('notes')}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createAppointment.isPending || updateAppointment.isPending}
            >
              {appointment ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
