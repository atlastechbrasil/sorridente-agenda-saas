
import { useState } from 'react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Key } from "lucide-react";
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { resetPassword, user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordReset = async () => {
    if (user?.email) {
      setIsResetting(true);
      const success = await resetPassword(user.email);
      
      if (success) {
        toast.success('Email de redefinição enviado com sucesso!');
      } else {
        toast.error('Erro ao enviar email de redefinição');
      }
      setIsResetting(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Simulação de alteração de senha
    toast.success('Senha alterada com sucesso!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Configure as preferências do sistema</p>
              </div>
              
              <div className="grid gap-6">
                {/* Aparência */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      Aparência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="theme-toggle">Tema Escuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Alternar entre tema claro e escuro
                        </p>
                      </div>
                      <Switch
                        id="theme-toggle"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Redefinir senha por email */}
                    <div className="space-y-3">
                      <div>
                        <Label>Redefinir Senha</Label>
                        <p className="text-sm text-muted-foreground">
                          Envie um email para redefinir sua senha
                        </p>
                      </div>
                      <Button 
                        onClick={handlePasswordReset}
                        disabled={isResetting}
                        variant="outline"
                      >
                        {isResetting ? 'Enviando...' : 'Enviar Email de Redefinição'}
                      </Button>
                    </div>

                    {/* Alterar senha */}
                    <div className="border-t pt-6">
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <Label>Alterar Senha</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Altere sua senha diretamente aqui
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Senha Atual</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Digite sua senha atual"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nova Senha</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Digite a nova senha"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirme a nova senha"
                          />
                        </div>
                        
                        <Button type="submit">
                          Alterar Senha
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
