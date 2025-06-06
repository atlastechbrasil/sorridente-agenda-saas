
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ArrowUpDown } from 'lucide-react';

interface TableFiltersProps {
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'date' | 'select';
    options?: string[];
  }>;
  onFilter: (filters: Record<string, string>) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
}

export const TableFilters = ({ columns, onFilter, onSort }: TableFiltersProps) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleFilterChange = (column: string, value: string) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const getSelectDisplayValue = (key: string, options: string[]) => {
    const currentValue = filters[key];
    if (!currentValue) return 'Todos';
    
    // Transform display values for better UX
    const valueMap: Record<string, string> = {
      'general': 'Geral',
      'specific': 'Específico',
      'active': 'Ativo',
      'expired': 'Expirado'
    };
    
    return valueMap[currentValue] || currentValue;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrar por:</h4>
              {columns.map((column) => (
                <div key={column.key} className="space-y-2">
                  <label className="text-sm font-medium">{column.label}</label>
                  {column.type === 'select' ? (
                    <Select
                      value={filters[column.key] || 'all'}
                      onValueChange={(value) => handleFilterChange(column.key, value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {getSelectDisplayValue(column.key, column.options || [])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {column.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === 'general' ? 'Geral' :
                             option === 'specific' ? 'Específico' :
                             option === 'active' ? 'Ativo' :
                             option === 'expired' ? 'Expirado' :
                             option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={column.type === 'date' ? 'date' : 'text'}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      placeholder={`Filtrar por ${column.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={sortColumn || 'none'} onValueChange={(value) => value !== 'none' && handleSort(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ordenar por...</SelectItem>
            {columns.map((column) => (
              <SelectItem key={column.key} value={column.key}>
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sortColumn && handleSort(sortColumn)}
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        </Button>
      </div>
    </div>
  );
};
