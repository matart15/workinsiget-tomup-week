import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { sendErrorMessage } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const getUserConciergeCategory = async ({
  categoryId,
}: {
  categoryId: number;
}) => {
  const { data, error } = await supabase
    .from('concierge_category')
    .select('*')
    .eq('id', categoryId)
    .single();
  if (error) {
    sendErrorMessage(error);
    throw error;
  }
  return data;
};

export const useGetConciergeCategory = ({
  categoryId,
}: {
  categoryId: number;
}) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.concierge.category({ categoryId }),
    queryFn: () => getUserConciergeCategory({ categoryId }),
  });
  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
