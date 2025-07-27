import { useMutation, useQueryClient } from '@tanstack/react-query';
import type z from 'zod';

import type { conciergeUpdateSchema } from '@/__generated__/schema';
import { QUERY_KEYS } from '@/lib/const';
import { supabase } from '@/lib/supabase';

const updateConcierge = async ({
  values,
}: { values: z.infer<typeof conciergeUpdateSchema> }) => {
  if (!values.id) {
    throw new Error('Missing concierge id');
  }
  const { data, error } = await supabase
    .from('concierge')
    .update(values)
    .eq('id', values.id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const useUpdateConcierge = () => {
  const queryClient = useQueryClient();
  const updateConciergeMutation = useMutation({
    mutationFn: updateConcierge,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.concierge.all(),
      });
    },
  });
  return {
    updateConcierge: updateConciergeMutation.mutateAsync,
  };
};
