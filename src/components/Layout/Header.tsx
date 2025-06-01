
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from './GlobalSearch';
import { useNotifications } from '@/hooks/useNotifications';

const Header = () => {
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">DentalCare Pro</h1>
          </div>
          
          <GlobalSearch />
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dr. Silva</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
