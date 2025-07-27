import { useMutation, useQueryClient } from '@tanstack/react-query';
import type z from 'zod';

import type { conciergeInsertSchema } from '@/__generated__/schema';
import { QUERY_KEYS } from '@/lib/const';
import { supabase } from '@/lib/supabase';

const addConcierge = async ({
  values,
}: { values: z.infer<typeof conciergeInsertSchema> }) => {
  console.log('🚀 ~ useAddConcierge.addConcierge.values :', values);
  const { data, error } = await supabase.from('concierge').insert(values).select().single();
  console.log(`🚀 ~ { data, error } :`, { data, error });
  if (error) {
    throw error;
  }
  return data;
};

export const useAddConcierge = () => {
  const queryClient = useQueryClient();
  const addConciergeMutation = useMutation({
    mutationFn: addConcierge,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.concierge.all(),
      });
    },
  });
  return {
    addConcierge: addConciergeMutation.mutateAsync,
  };
};
