
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Procedure = Tables<'procedures'>;
type ProcedureInsert = TablesInsert<'procedures'>;
type ProcedureUpdate = TablesUpdate<'procedures'>;

export const useProcedures = () => {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      console.log('Fetching procedures...');
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching procedures:', error);
        throw error;
      }
      
      console.log('Procedures fetched:', data?.length);
      return data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (procedure: ProcedureInsert) => {
      const { data, error } = await supabase
        .from('procedures')
        .insert(procedure)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast.success('Procedimento criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar procedimento');
    },
  });
};

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProcedureUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('procedures')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast.success('Procedimento atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar procedimento');
    },
  });
};

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('procedures')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast.success('Procedimento desativado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao desativar procedimento');
    },
  });
};
