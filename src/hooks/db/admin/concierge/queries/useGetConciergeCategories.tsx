import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { sendErrorMessage } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const getConciergeCategories = async () => {
  const { data, error } = await supabase.from('concierge_category').select('*');
  if (error) {
    sendErrorMessage(error);
    return [];
  }
  return data;
};

export const useGetConciergeCategories = () => {
  const query = useQuery({
    queryKey: QUERY_KEYS.concierge.categories(),
    queryFn: () => getConciergeCategories(),
  });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
