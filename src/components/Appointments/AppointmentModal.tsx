
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDentists } from '@/hooks/useDentists';
import { useProcedures } from '@/hooks/useProcedures';
import { Tables } from '@/integrations/supabase/types';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  duration?: number;
  notes?: string;
  status: string;
}

export const AppointmentModal = ({ isOpen, onClose, appointment }: AppointmentModalProps) => {
  const { data: patients } = usePatients();
  const { data: dentists } = useDentists();
  const { data: procedures } = useProcedures();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentFormData>();

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  // Load existing appointment procedures
  const loadAppointmentProcedures = async (appointmentId: string) => {
    try {
      setLoadingProcedures(true);
      console.log('Loading procedures for appointment:', appointmentId);
      
      const { data: appointmentProcedures, error } = await supabase
        .from('appointment_procedures')
        .select('procedure_id')
        .eq('appointment_id', appointmentId);

      if (error) {
        console.error('Error loading appointment procedures:', error);
        return;
      }

      const procedureIds = appointmentProcedures.map(ap => ap.procedure_id);
      console.log('Found procedure IDs:', procedureIds);
      setSelectedProcedures(procedureIds);
    } catch (error) {
      console.error('Error loading appointment procedures:', error);
    } finally {
      setLoadingProcedures(false);
    }
  };

  // Calculate total price and duration
  const calculateTotals = () => {
    if (!procedures || selectedProcedures.length === 0) {
      return { totalPrice: 0, totalDuration: 60 };
    }

    const selectedProcedureData = procedures.filter(p => selectedProcedures.includes(p.id));
    const totalPrice = selectedProcedureData.reduce((sum, p) => sum + Number(p.price), 0);
    const totalDuration = selectedProcedureData.reduce((sum, p) => sum + (p.duration || 60), 0);

    return { totalPrice, totalDuration };
  };

  const { totalPrice, totalDuration } = calculateTotals();

  // Reset form with appointment data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        const formData = {
          patient_id: appointment.patient_id,
          dentist_id: appointment.dentist_id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          duration: appointment.duration || 60,
          notes: appointment.notes || '',
          status: appointment.status,
        };
        
        reset(formData);
        setSelectedPatient(appointment.patient_id);
        setSelectedDentist(appointment.dentist_id);
        setSelectedStatus(appointment.status);
        
        // Load the selected procedures for this appointment
        loadAppointmentProcedures(appointment.id);
      } else {
        reset({
          patient_id: '',
          dentist_id: '',
          appointment_date: '',
          appointment_time: '',
          duration: 60,
          notes: '',
          status: 'pending'
        });
        setSelectedPatient('');
        setSelectedDentist('');
        setSelectedStatus('pending');
        setSelectedProcedures([]);
      }
    }
  }, [isOpen, appointment, reset]);

  const handleProcedureToggle = (procedureId: string, checked: boolean) => {
    if (checked) {
      setSelectedProcedures(prev => [...prev, procedureId]);
    } else {
      setSelectedProcedures(prev => prev.filter(id => id !== procedureId));
    }
  };

  const saveAppointmentProcedures = async (appointmentId: string) => {
    try {
      // First, delete existing appointment procedures
      await supabase
        .from('appointment_procedures')
        .delete()
        .eq('appointment_id', appointmentId);

      // Then insert new ones
      if (selectedProcedures.length > 0 && procedures) {
        const appointmentProceduresToInsert = selectedProcedures.map(procedureId => {
          const procedure = procedures.find(p => p.id === procedureId);
          return {
            appointment_id: appointmentId,
            procedure_id: procedureId,
            price: procedure?.price || 0
          };
        });

        const { error } = await supabase
          .from('appointment_procedures')
          .insert(appointmentProceduresToInsert);

        if (error) {
          console.error('Error saving appointment procedures:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error saving appointment procedures:', error);
      throw error;
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (selectedProcedures.length === 0) {
        alert('Selecione pelo menos um procedimento');
        return;
      }

      const formData = {
        ...data,
        patient_id: selectedPatient,
        dentist_id: selectedDentist,
        status: selectedStatus,
        duration: totalDuration,
        procedure_type: procedures?.filter(p => selectedProcedures.includes(p.id)).map(p => p.name).join(', ') || ''
      };

      let appointmentId: string;

      if (appointment) {
        const updatedAppointment = await updateAppointment.mutateAsync({ id: appointment.id, ...formData });
        appointmentId = appointment.id;
      } else {
        const newAppointment = await createAppointment.mutateAsync(formData);
        appointmentId = newAppointment.id;
      }

      // Save appointment procedures
      await saveAppointmentProcedures(appointmentId);
      
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
    setSelectedProcedures([]);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <Label>Procedimentos *</Label>
            {loadingProcedures ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando procedimentos...</span>
              </div>
            ) : (
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-3">
                  {procedures?.map((procedure) => (
                    <div key={procedure.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={procedure.id}
                          checked={selectedProcedures.includes(procedure.id)}
                          onCheckedChange={(checked) => handleProcedureToggle(procedure.id, checked as boolean)}
                        />
                        <div>
                          <label htmlFor={procedure.id} className="text-sm font-medium cursor-pointer">
                            {procedure.name}
                          </label>
                          {procedure.description && (
                            <p className="text-xs text-gray-500">{procedure.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(Number(procedure.price))}
                        </div>
                        <div className="text-xs text-gray-500">{procedure.duration}min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedProcedures.length > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(totalPrice)}
                    </div>
                    <div className="text-sm text-gray-600">{totalDuration} minutos</div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={createAppointment.isPending || updateAppointment.isPending || loadingProcedures}
            >
              {appointment ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
