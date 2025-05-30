
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Dentist = Tables<'dentists'>;
type DentistInsert = TablesInsert<'dentists'>;
type DentistUpdate = TablesUpdate<'dentists'>;

export const useDentists = () => {
  return useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dentists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateDentist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dentist: DentistInsert) => {
      const { data, error } = await supabase
        .from('dentists')
        .insert(dentist)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      toast.success('Dentista criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar dentista');
    },
  });
};

export const useUpdateDentist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: DentistUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('dentists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      toast.success('Dentista atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar dentista');
    },
  });
};

export const useDeleteDentist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dentists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      toast.success('Dentista excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir dentista');
    },
  });
};
