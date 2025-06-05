
import { useState, useEffect, useCallback } from 'react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Users as UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { UserModal } from '@/components/Users/UserModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'assistant';
  createdAt: string;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  dentist: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  assistant: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
};

const roleLabels = {
  admin: 'Administrador',
  dentist: 'Dentista',
  assistant: 'Assistente'
};

const Users = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { hasPermission } = usePermissions();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const loadUsers = useCallback(async () => {
    if (isLoadingUsers) return; // Prevent multiple concurrent loads
    
    try {
      setIsLoadingUsers(true);
      console.log('Loading users from profiles...');
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
          
      if (profileError) {
        console.error('Error loading profiles:', profileError);
        toast.error('Erro ao carregar usuários');
        return;
      }

      const formattedUsers: User[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.email,
        email: profile.email,
        role: profile.role as 'admin' | 'dentist' | 'assistant',
        createdAt: new Date(profile.created_at || '').toISOString().split('T')[0]
      })) || [];

      console.log('Loaded users:', formattedUsers.length);
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
      setLoading(false);
    }
  }, [isLoadingUsers]);

  useEffect(() => {
    if (hasPermission('manage_users') && !isLoadingUsers) {
      loadUsers();
    } else if (!hasPermission('manage_users')) {
      setLoading(false);
    }
  }, [hasPermission, loadUsers]);

  if (!hasPermission('manage_users')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <main className="flex-1 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Você não tem permissão para gerenciar usuários.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        console.log('Deleting user:', id);
        
        // Delete user roles first
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        if (roleError) {
          console.error('Error deleting user role:', roleError);
        }

        // Delete profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (profileError) {
          console.error('Error deleting profile:', profileError);
          toast.error('Erro ao excluir perfil do usuário');
          return;
        }

        toast.success('Usuário excluído com sucesso!');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    try {
      console.log('Saving user data:', userData);
      
      if (selectedUser) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: userData.name,
            email: userData.email,
            role: userData.role
          })
          .eq('id', selectedUser.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          toast.error('Erro ao atualizar usuário');
          return;
        }

        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: selectedUser.id, 
            role: userData.role 
          });

        if (roleError) {
          console.error('Error updating role:', roleError);
        }

        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Create new user - Use Edge Function for proper user creation
        if (!userData.password || userData.password.length < 6) {
          toast.error('Senha deve ter pelo menos 6 caracteres');
          return;
        }

        console.log('Creating new user with email:', userData.email);

        // Call Edge Function to create user with admin privileges
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: userData.email,
            password: userData.password,
            full_name: userData.name,
            role: userData.role
          }
        });

        if (error) {
          console.error('Error creating user:', error);
          toast.error('Erro ao criar usuário: ' + error.message);
          return;
        }

        console.log('User created successfully:', data);
        toast.success('Usuário criado com sucesso!');
      }

      loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar usuário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie os usuários do sistema</p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Lista de Usuários ({users.length})
                  </CardTitle>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Carregando usuários...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role]}>
                              {roleLabels[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {users.length === 0 && !isLoadingUsers && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                  </div>
                )}
              </CardContent>
            </Card>

            <UserModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              user={selectedUser}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
