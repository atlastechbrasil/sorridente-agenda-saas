
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Permission = 
  | 'view_dashboard'
  | 'manage_appointments'
  | 'manage_patients'
  | 'manage_dentists'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_procedures'
  | 'manage_users';

export const usePermissions = () => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) {
        setUserPermissions([]);
        setUserRoles([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Loading permissions for user role:', user.role);
        
        // Carregar permissões baseadas no role do profile
        const { data: rolePermissions, error } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions:permission_id (
              name
            )
          `)
          .eq('role', user.role);

        if (error) {
          console.error('Error loading role permissions:', error);
        } else if (rolePermissions) {
          const permissions = rolePermissions
            .map(rp => rp.permissions?.name)
            .filter(Boolean);
          console.log('Loaded permissions from DB:', permissions);
          setUserPermissions(permissions);
        }

        // Carregar roles adicionais do usuário
        const { data: additionalRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error loading additional roles:', rolesError);
        } else if (additionalRoles) {
          setUserRoles(additionalRoles.map(r => r.role));
        }
      } catch (error) {
        console.error('Error loading user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();

    // Recarregar permissões quando há mudanças na tabela role_permissions
    const channel = supabase
      .channel('role_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions'
        },
        () => {
          console.log('Role permissions changed, reloading...');
          loadUserPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.role]); // Added user.role dependency

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    console.log('Checking permission:', permission, 'User permissions:', userPermissions);
    
    // Verificar permissões do role principal
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Para compatibilidade, manter a lógica anterior se não encontrar nas novas tabelas
    const rolePermissions: Record<string, Permission[]> = {
      admin: [
        'view_dashboard',
        'manage_appointments',
        'manage_patients',
        'manage_dentists',
        'view_reports',
        'manage_settings',
        'manage_procedures',
        'manage_users'
      ],
      dentist: [
        'view_dashboard',
        'manage_appointments',
        'manage_patients',
        'view_reports'
      ],
      assistant: [
        'view_dashboard',
        'manage_appointments',
        'manage_patients'
      ]
    };

    const primaryRolePermissions = rolePermissions[user.role] || [];
    return primaryRolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role,
    userRoles,
    userPermissions,
    loading
  };
};
