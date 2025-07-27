import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const useStaffMatches = (staffId?: string) => {
  return useQuery({
    queryKey: ['staff', 'matches', staffId],
    queryFn: async () => {
      if (!staffId) {
        return [];
      }
      const { data, error } = await supabase
        .from('s_matches')
        .select('*, user:users(*)') // join user data
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: !!staffId,
  });
};
