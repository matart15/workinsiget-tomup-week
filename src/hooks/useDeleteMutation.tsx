import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const useDeleteMutation = ({
  id,
  tableName,
}: {
  id: number | string;
  tableName: string;
}) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () =>
      supabase

        .from(tableName as any)
        .delete()
        .eq('id', id),
    onSuccess: () => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({
        queryKey: [tableName],
      });
    },
  });
  return () => deleteMutation.mutateAsync();
};
