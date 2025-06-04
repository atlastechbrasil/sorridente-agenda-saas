
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'assistant';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Função para carregar perfil do usuário
    const loadUserProfile = async (authUser: User) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (profile && mounted) {
          setUser({
            id: profile.id,
            name: profile.full_name || profile.email,
            email: profile.email,
            role: profile.role as 'admin' | 'dentist' | 'assistant'
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Verificar sessão inicial DEPOIS
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('Attempting to reset password for email:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        return false;
      }
      
      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.error('No authenticated user found');
        return false;
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentUser.email!,
        password: currentPassword,
      });

      if (reauthError) {
        console.error('Re-authentication failed:', reauthError);
        return false;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Password update error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      resetPassword, 
      changePassword,
      isAuthenticated, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
