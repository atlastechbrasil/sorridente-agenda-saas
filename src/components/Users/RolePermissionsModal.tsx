
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface RolePermission {
  role: string;
  permissions: string[];
}

const defaultRoles = ['admin', 'dentist', 'assistant'];

export const RolePermissionsModal = ({ isOpen, onClose }: RolePermissionsModalProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(true);

  const allRoles = [...defaultRoles, ...customRoles];

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar permissões
      const { data: permissionsData, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (permError) {
        console.error('Error loading permissions:', permError);
        toast.error('Erro ao carregar permissões');
        return;
      }

      setPermissions(permissionsData || []);

      // Carregar permissões por role
      const { data: rolePermData, error: rolePermError } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permissions:permission_id (
            name
          )
        `);

      if (rolePermError) {
        console.error('Error loading role permissions:', rolePermError);
        toast.error('Erro ao carregar permissões de roles');
        return;
      }

      // Agrupar permissões por role
      const groupedPermissions: Record<string, string[]> = {};
      
      rolePermData?.forEach(rp => {
        if (!groupedPermissions[rp.role]) {
          groupedPermissions[rp.role] = [];
        }
        if (rp.permissions?.name) {
          groupedPermissions[rp.role].push(rp.permissions.name);
        }
      });

      const formattedRolePermissions = Object.entries(groupedPermissions).map(([role, perms]) => ({
        role,
        permissions: perms
      }));

      setRolePermissions(formattedRolePermissions);

      // Carregar custom roles (por enquanto, vamos usar apenas os padrão)
      // Quando a tabela custom_roles estiver disponível nos tipos, podemos adicionar:
      // const { data: customRolesData } = await supabase.from('custom_roles').select('name');
      // setCustomRoles(customRolesData?.map(r => r.name) || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (role: string, permissionName: string, checked: boolean) => {
    try {
      const permission = permissions.find(p => p.name === permissionName);
      if (!permission) return;

      if (checked) {
        // Adicionar permissão
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role,
            permission_id: permission.id
          });

        if (error) {
          console.error('Error adding permission:', error);
          toast.error('Erro ao adicionar permissão');
          return;
        }
      } else {
        // Remover permissão
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permission.id);

        if (error) {
          console.error('Error removing permission:', error);
          toast.error('Erro ao remover permissão');
          return;
        }
      }

      // Atualizar estado local
      setRolePermissions(prev => {
        const existing = prev.find(rp => rp.role === role);
        if (existing) {
          return prev.map(rp => 
            rp.role === role 
              ? {
                  ...rp,
                  permissions: checked 
                    ? [...rp.permissions, permissionName]
                    : rp.permissions.filter(p => p !== permissionName)
                }
              : rp
          );
        } else {
          return [...prev, { role, permissions: [permissionName] }];
        }
      });

      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const createCustomRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Nome da função é obrigatório');
      return;
    }

    if (allRoles.includes(newRoleName.toLowerCase())) {
      toast.error('Esta função já existe');
      return;
    }

    try {
      // Por enquanto, vamos apenas adicionar ao estado local
      // Quando a tabela estiver nos tipos, implementaremos a persistência
      setCustomRoles(prev => [...prev, newRoleName]);
      setNewRoleName('');
      toast.success('Função customizada criada com sucesso!');
    } catch (error) {
      console.error('Error creating custom role:', error);
      toast.error('Erro ao criar função customizada');
    }
  };

  const deleteCustomRole = async (roleName: string) => {
    if (defaultRoles.includes(roleName)) {
      toast.error('Não é possível excluir funções padrão');
      return;
    }

    try {
      // Remover todas as permissões da role
      const { error: permError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', roleName);

      if (permError) {
        console.error('Error deleting role permissions:', permError);
        toast.error('Erro ao excluir permissões da função');
        return;
      }

      // Remover do estado local
      setCustomRoles(prev => prev.filter(r => r !== roleName));
      setRolePermissions(prev => prev.filter(rp => rp.role !== roleName));

      toast.success('Função customizada excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting custom role:', error);
      toast.error('Erro ao excluir função customizada');
    }
  };

  const getRolePermissions = (role: string): string[] => {
    return rolePermissions.find(rp => rp.role === role)?.permissions || [];
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
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
          <DialogTitle>Gerenciar Permissões e Funções</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção para criar nova função */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="newRole">Nome da Função</Label>
                  <Input
                    id="newRole"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Digite o nome da nova função"
                  />
                </div>
                <Button onClick={createCustomRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Função
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de permissões por role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRoles.map((role) => (
              <Card key={role}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">
                      {role === 'admin' ? 'Administrador' :
                       role === 'dentist' ? 'Dentista' :
                       role === 'assistant' ? 'Assistente' : role}
                    </CardTitle>
                    {!defaultRoles.includes(role) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCustomRole(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${role}-${permission.name}`}
                          checked={getRolePermissions(role).includes(permission.name)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(role, permission.name, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`${role}-${permission.name}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
