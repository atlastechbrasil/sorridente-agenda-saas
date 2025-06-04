
import { useState } from 'react';
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { ProceduresList } from "@/components/Procedures/ProceduresList";

const Procedures = () => {
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Procedimentos</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gerencie os procedimentos médicos da clínica
              </p>
            </div>
            
            <ProceduresList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Procedures;
