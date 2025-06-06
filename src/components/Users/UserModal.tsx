
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'assistant';
  createdAt: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => void;
  user?: User | null;
}

export const UserModal = ({ isOpen, onClose, onSave, user }: UserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'dentist' as 'admin' | 'dentist' | 'assistant',
    password: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'dentist',
        password: ''
      });
    }
  }, [user, isOpen]);

  const handlePasswordUpdate = async () => {
    if (!user || !formData.password || formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    try {
      setIsUpdating(true);
      
      // Use admin API to update user password
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: formData.password }
      );

      if (error) {
        console.error('Error updating password:', error);
        toast.error('Erro ao alterar senha: ' + error.message);
        return false;
      }

      toast.success('Senha alterada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao alterar senha');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!user && !formData.password) {
      toast.error('Por favor, defina uma senha para o novo usuário');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // For existing users with password change
    if (user && formData.password) {
      const passwordUpdated = await handlePasswordUpdate();
      if (!passwordUpdated) {
        return;
      }
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.password && { password: formData.password })
    };

    onSave(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do usuário"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Função *</Label>
            <Select value={formData.role} onValueChange={(value: 'admin' | 'dentist' | 'assistant') => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="dentist">Dentista</SelectItem>
                <SelectItem value="assistant">Assistente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? 'Nova Senha (opcional)' : 'Senha *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={user ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
              minLength={6}
              {...(!user && { required: true })}
            />
            {!user && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A senha deve ter pelo menos 6 caracteres
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Atualizando...' : (user ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
