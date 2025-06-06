
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Check, X, Plus, Trash2 } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RolePermission {
  role: string;
  permission_id: string;
}

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultRoleLabels = {
  admin: 'Administrador',
  dentist: 'Dentista',
  assistant: 'Assistente'
};

export const RolePermissionsModal = ({ isOpen, onClose }: RolePermissionsModalProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar permissões
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (permissionsError) {
        console.error('Error loading permissions:', permissionsError);
        toast.error('Erro ao carregar permissões');
        return;
      }

      // Carregar permissões por role
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from('role_permissions')
        .select('*');

      if (rolePermissionsError) {
        console.error('Error loading role permissions:', rolePermissionsError);
        toast.error('Erro ao carregar permissões dos roles');
        return;
      }

      // Carregar roles customizados (além dos padrão)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'in', '(admin,dentist,assistant)');

      if (profilesError) {
        console.error('Error loading custom roles:', profilesError);
      }

      const uniqueCustomRoles = profilesData 
        ? [...new Set(profilesData.map(p => p.role))]
        : [];

      setPermissions(permissionsData || []);
      setRolePermissions(rolePermissionsData || []);
      setCustomRoles(uniqueCustomRoles);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getAllRoles = () => {
    return [...Object.keys(defaultRoleLabels), ...customRoles];
  };

  const getRoleLabel = (role: string) => {
    return defaultRoleLabels[role as keyof typeof defaultRoleLabels] || role;
  };

  const hasPermission = (role: string, permissionId: string) => {
    return rolePermissions.some(rp => rp.role === role && rp.permission_id === permissionId);
  };

  const togglePermission = async (role: string, permissionId: string) => {
    const hasCurrentPermission = hasPermission(role, permissionId);
    
    try {
      if (hasCurrentPermission) {
        // Remover permissão
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId);

        if (error) {
          console.error('Error removing permission:', error);
          toast.error('Erro ao remover permissão');
          return;
        }

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role === role && rp.permission_id === permissionId))
        );
      } else {
        // Adicionar permissão
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId });

        if (error) {
          console.error('Error adding permission:', error);
          toast.error('Erro ao adicionar permissão');
          return;
        }

        setRolePermissions(prev => [...prev, { role, permission_id: permissionId }]);
      }

      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const createNewRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Digite o nome da nova função');
      return;
    }

    if (getAllRoles().includes(newRoleName.toLowerCase())) {
      toast.error('Esta função já existe');
      return;
    }

    try {
      setCustomRoles(prev => [...prev, newRoleName.toLowerCase()]);
      setNewRoleName('');
      toast.success('Nova função criada com sucesso!');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Erro ao criar nova função');
    }
  };

  const deleteCustomRole = async (roleToDelete: string) => {
    if (Object.keys(defaultRoleLabels).includes(roleToDelete)) {
      toast.error('Não é possível deletar funções padrão do sistema');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar a função "${roleToDelete}"?`)) {
      return;
    }

    try {
      // Remover todas as permissões do role
      const { error: permError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', roleToDelete);

      if (permError) {
        console.error('Error deleting role permissions:', permError);
        toast.error('Erro ao deletar permissões da função');
        return;
      }

      setCustomRoles(prev => prev.filter(r => r !== roleToDelete));
      setRolePermissions(prev => prev.filter(rp => rp.role !== roleToDelete));
      toast.success('Função deletada com sucesso!');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Erro ao deletar função');
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gerenciar Permissões por Função
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciar Permissões por Função
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Criar nova função */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criar Nova Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome da nova função"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewRole()}
                />
                <Button onClick={createNewRole} disabled={saving}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gerenciar permissões por função */}
          {getAllRoles().map((role) => (
            <Card key={role}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{getRoleLabel(role)}</CardTitle>
                  {!Object.keys(defaultRoleLabels).includes(role) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCustomRole(role)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${role}-${permission.id}`}
                        checked={hasPermission(role, permission.id)}
                        onCheckedChange={() => togglePermission(role, permission.id)}
                        disabled={saving}
                      />
                      <Label 
                        htmlFor={`${role}-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{permission.description}</div>
                          <div className="text-xs text-gray-500">{permission.name}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
