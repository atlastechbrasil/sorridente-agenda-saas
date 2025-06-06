
import { useState, useMemo } from 'react';
import { useCoupons, useDeleteCoupon } from '@/hooks/useCoupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Percent, User, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CouponModal } from './CouponModal';
import { TableFilters } from '@/components/ui/table-filters';

export const CouponsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { data: coupons, isLoading, error } = useCoupons();
  const deleteCoupon = useDeleteCoupon();

  const filteredAndSortedCoupons = useMemo(() => {
    if (!coupons) return [];

    let filtered = coupons.filter(coupon => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'code':
            return coupon.code.toLowerCase().includes(value.toLowerCase());
          case 'type':
            return coupon.type === value;
          case 'status':
            const isActive = new Date() <= new Date(coupon.expires_at) && 
                           (coupon.max_uses === null || coupon.used_count < coupon.max_uses);
            return value === 'active' ? isActive : !isActive;
          default:
            return true;
        }
      });
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn as keyof typeof a];
        let bValue = b[sortColumn as keyof typeof b];

        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [coupons, filters, sortColumn, sortDirection]);

  const filterColumns = [
    { key: 'code', label: 'Código', type: 'text' as const },
    { 
      key: 'type', 
      label: 'Tipo', 
      type: 'select' as const,
      options: ['general', 'specific']
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['active', 'expired']
    }
  ];

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Tem certeza que deseja excluir o cupom ${code}?`)) {
      deleteCoupon.mutate(id);
    }
  };

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCouponStatus = (coupon: any) => {
    const now = new Date();
    const expiresAt = new Date(coupon.expires_at);
    const isExpired = now > expiresAt;
    const isMaxUsed = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
    
    if (isExpired || isMaxUsed) {
      return { label: 'Expirado', color: 'bg-red-100 text-red-800' };
    }
    return { label: 'Ativo', color: 'bg-green-100 text-green-800' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando cupons...</div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar cupons:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar cupons</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Cupons ({filteredAndSortedCoupons.length})</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TableFilters
            columns={filterColumns}
            onFilter={setFilters}
            onSort={(column, direction) => {
              setSortColumn(column);
              setSortDirection(direction);
            }}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCoupons?.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium font-mono">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-green-600" />
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%`
                          : formatCurrency(coupon.discount_value)
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {coupon.type === 'general' ? (
                          <>
                            <Users className="h-3 w-3 text-blue-600" />
                            Geral
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-purple-600" />
                            Específico
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.max_uses ? `${coupon.used_count}/${coupon.max_uses}` : `${coupon.used_count}/∞`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          disabled={deleteCoupon.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredAndSortedCoupons?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {Object.keys(filters).some(key => filters[key]) ? 
                'Nenhum cupom encontrado com os filtros aplicados' : 
                'Nenhum cupom cadastrado'
              }
            </div>
          )}
        </CardContent>
      </Card>

      <CouponModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coupon={selectedCoupon}
      />
    </>
  );
};
