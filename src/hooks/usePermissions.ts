
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

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const loadUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        return;
      }

      try {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roles) {
          setUserRoles(roles.map(r => r.role));
        }
      } catch (error) {
        console.error('Error loading user roles:', error);
      }
    };

    loadUserRoles();
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Check primary role from profile
    const primaryRolePermissions = rolePermissions[user.role] || [];
    if (primaryRolePermissions.includes(permission)) {
      return true;
    }

    // Check additional roles
    return userRoles.some(role => 
      rolePermissions[role]?.includes(permission)
    );
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
    userRoles
  };
};
