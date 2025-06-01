
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { searchTerm, setSearchTerm, searchResults } = useSearch();
  const navigate = useNavigate();

  const handleSelect = (route: string) => {
    navigate(route);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input 
        placeholder="Buscar pacientes, agendamentos..." 
        className="pl-10 bg-gray-50 border-gray-200"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(e.target.value.length > 0);
        }}
        onFocus={() => setIsOpen(searchTerm.length > 0)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <Command>
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.route)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-sm text-gray-500">{result.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
