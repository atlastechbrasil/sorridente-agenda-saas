
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Users, UserCheck, BarChart3, Settings, FileText, ChevronLeft, ChevronRight, UsersRound, Stethoscope, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { hasPermission } = usePermissions();
  
  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/",
      permission: 'view_dashboard'
    },
    {
      icon: Calendar,
      label: "Agendamentos",
      path: "/agendamentos",
      permission: 'manage_appointments'
    },
    {
      icon: Users,
      label: "Pacientes",
      path: "/pacientes",
      permission: 'manage_patients'
    },
    {
      icon: UserCheck,
      label: "Dentistas",
      path: "/dentistas",
      permission: 'manage_dentists'
    },
    {
      icon: Stethoscope,
      label: "Procedimentos",
      path: "/procedimentos",
      permission: 'manage_procedures'
    },
    {
      icon: Ticket,
      label: "Cupons",
      path: "/cupons",
      permission: 'manage_settings'
    },
    {
      icon: UsersRound,
      label: "Usuários",
      path: "/usuarios",
      permission: 'manage_users'
    },
    {
      icon: FileText,
      label: "Relatórios",
      path: "/relatorios",
      permission: 'view_reports'
    },
    {
      icon: Settings,
      label: "Configurações",
      path: "/configuracoes",
      permission: 'manage_settings'
    }
  ];

  const visibleItems = menuItems.filter(item => !item.permission || hasPermission(item.permission as any));

  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          className="ml-auto block dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="space-y-2 px-[10px]">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
