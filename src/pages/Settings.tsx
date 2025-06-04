
import { useState } from 'react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Key } from 'lucide-react';
import { ProfileTab } from '@/components/Settings/ProfileTab';
import { SecurityTab } from '@/components/Settings/SecurityTab';

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gerencie suas preferências e configurações da conta
              </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
