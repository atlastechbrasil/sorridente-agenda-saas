
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = () => {
  const { hasPermission } = usePermissions();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Visão geral do sistema</p>
              </div>
              
              {hasPermission('view_dashboard') ? (
                <StatsCards />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Acesso Negado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      Você não tem permissão para visualizar o dashboard.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
