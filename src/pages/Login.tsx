
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { login, resetPassword, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, preencha o email');
      return;
    }

    if (isResetMode) {
      setIsResetting(true);
      const success = await resetPassword(email);
      
      if (success) {
        toast.success('Email de redefinição enviado com sucesso!');
        setIsResetMode(false);
      } else {
        toast.error('Email não encontrado');
      }
      setIsResetting(false);
      return;
    }

    if (!password) {
      toast.error('Por favor, preencha a senha');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error('Email ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DC</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">DentalCare Pro</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {isResetMode ? 'Redefinir senha' : 'Faça login para acessar o sistema'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isResetting}
              />
            </div>
            {!isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isResetting}
            >
              {isLoading || isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isResetMode ? 'Enviando...' : 'Entrando...'}
                </>
              ) : (
                isResetMode ? 'Enviar Email' : 'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsResetMode(!isResetMode)}
              disabled={isLoading || isResetting}
              className="text-sm"
            >
              {isResetMode ? 'Voltar para login' : 'Esqueci minha senha'}
            </Button>
          </div>
          
          {!isResetMode && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Credenciais de teste:
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Email: admin@dentalcare.com<br />
                Senha: admin123
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
