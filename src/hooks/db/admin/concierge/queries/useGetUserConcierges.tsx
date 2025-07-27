import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { sendErrorMessage } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const getUserConcierges = async () => {
  const { data, error } = await supabase.from('concierge').select(
    `
    *,
    concierge_category(*)
    `,
  );
  if (error) {
    sendErrorMessage(error);
    return [];
  }
  return data;
};

export const useGetUserConcierges = () => {
  const query = useQuery({
    queryKey: QUERY_KEYS.concierge.all(),
    queryFn: () => getUserConcierges(),
  });
  return {
    concierges: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
