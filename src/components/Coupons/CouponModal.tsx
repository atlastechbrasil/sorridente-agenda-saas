
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCoupon, useUpdateCoupon } from '@/hooks/useCoupons';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
}

export const CouponModal = ({ isOpen, onClose, coupon }: CouponModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    type: 'general',
    patient_id: '',
    max_uses: '',
    expires_at: '',
    description: ''
  });

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const { data: patients } = usePatients();

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value?.toString() || '',
        type: coupon.type || 'general',
        patient_id: coupon.patient_id || '',
        max_uses: coupon.max_uses?.toString() || '',
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        description: coupon.description || ''
      });
    } else {
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        type: 'general',
        patient_id: '',
        max_uses: '',
        expires_at: '',
        description: ''
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discount_value || !formData.expires_at) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.type === 'specific' && !formData.patient_id) {
      toast.error('Selecione um paciente para cupons específicos');
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type as 'percentage' | 'fixed',
      discount_value: parseFloat(formData.discount_value),
      type: formData.type as 'general' | 'specific',
      patient_id: formData.type === 'specific' ? formData.patient_id : null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at,
      description: formData.description || null
    };

    try {
      if (coupon) {
        await updateCoupon.mutateAsync({ id: coupon.id, ...couponData });
      } else {
        await createCoupon.mutateAsync(couponData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="Ex: DESC2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button type="button" variant="outline" onClick={generateCode} className="w-full">
                Gerar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">Tipo de Desconto</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem</SelectItem>
                  <SelectItem value="fixed">Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Valor * {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Cupom</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, patient_id: value === 'general' ? '' : prev.patient_id }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral (Todos os pacientes)</SelectItem>
                <SelectItem value="specific">Específico (Um paciente)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'specific' && (
            <div className="space-y-2">
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
              >
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_uses">Máximo de Usos</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                placeholder="Ilimitado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Data de Expiração *</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional do cupom"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createCoupon.isPending || updateCoupon.isPending}
            >
              {coupon ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
