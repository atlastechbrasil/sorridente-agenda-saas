
import { useAuth } from '@/contexts/AuthContext';

export type Permission = 
  | 'view_dashboard'
  | 'manage_appointments'
  | 'manage_patients'
  | 'manage_dentists'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_users';

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_appointments',
    'manage_patients',
    'manage_dentists',
    'view_reports',
    'manage_settings',
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

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
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
    userRole: user?.role
  };
};
