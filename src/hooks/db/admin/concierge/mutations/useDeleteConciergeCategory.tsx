import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { supabase } from '@/lib/supabase';

const deleteConciergeCategory = async ({ id }: { id: number }) => {
  const { error } = await supabase.from('concierge_category').delete().eq('id', id);
  if (error) {
    throw error;
  }
};

export const useDeleteConciergeCategory = () => {
  const queryClient = useQueryClient();
  const deleteConciergeCategoryMutation = useMutation({
    mutationFn: deleteConciergeCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.concierge.categories(),
      });
    },
  });
  return {
    deleteConciergeCategory: deleteConciergeCategoryMutation.mutateAsync,
    isDeleting: deleteConciergeCategoryMutation.status === 'pending',
  };
};
