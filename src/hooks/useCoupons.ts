
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      console.log('Fetching coupons...');
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          patients(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }
      
      console.log('Coupons fetched:', data?.length);
      return data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: any) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar cupom');
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar cupom');
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir cupom');
    },
  });
};
