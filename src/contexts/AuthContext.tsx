
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'assistant';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulação de login - em produção, fazer chamada para API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@dentalcare.com' && password === 'admin123') {
      const userData: User = {
        id: '1',
        name: 'Dr. Silva',
        email: 'admin@dentalcare.com',
        role: 'admin'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simulação de reset de senha - em produção, fazer chamada para API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula que sempre funciona para o email de teste
    return email === 'admin@dentalcare.com';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
