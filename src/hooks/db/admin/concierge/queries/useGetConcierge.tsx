import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { sendErrorMessage } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const getConcierge = async ({
  conciergeId,
}: {
  conciergeId: number;
}) => {
  const { data, error } = await supabase
    .from('concierge')
    .select(
      `
    *,
    users(*),
    concierge_category(*)
    `,
    )
    .eq('id', conciergeId)
    .single();
  if (error) {
    sendErrorMessage(error);
    throw error;
  }
  return data;
};

export const useGetConcierge = ({
  conciergeId,
}: {
  conciergeId: number;
}) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.concierge.detail({ conciergeId }),
    queryFn: () => getConcierge({ conciergeId }),
  });
  return {
    concierge: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
