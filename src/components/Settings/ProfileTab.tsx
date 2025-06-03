
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ProfileTab = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Profile update logic would go here
    toast.success('Perfil atualizado com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
            <p className="text-sm text-gray-500">
              O email não pode ser alterado
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Função</Label>
            <Input
              value={user?.role === 'admin' ? 'Administrador' : user?.role === 'dentist' ? 'Dentista' : 'Assistente'}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Atualizar Perfil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
