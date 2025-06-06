
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <GlobalSearch />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">☀️</span>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
            <span className="text-sm text-gray-600 dark:text-gray-300">🌙</span>
          </div>
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
