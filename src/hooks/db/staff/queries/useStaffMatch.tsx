import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/const';
import { supabase } from '@/lib/supabase';

const getOrCreateStaffMatch = async ({
  staffId,
  userId,
}: {
  staffId: string;
  userId: string;
}) => {
  // First try to find existing match
  const { data: existingMatch } = await supabase
    .from('s_matches')
    .select('id')
    .eq('staff_id', staffId)
    .eq('user_id', userId)
    .single();

  if (existingMatch) {
    return existingMatch.id;
  }

  // Create new match if doesn't exist
  const { data: newMatch, error } = await supabase
    .from('s_matches')
    .insert({
      staff_id: staffId,
      user_id: userId,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return newMatch.id;
};

export const useStaffMatch = ({
  staffId,
  userId,
  enabled = true,
}: {
  staffId: string;
  userId: string;
  enabled?: boolean;
}) => {
  const query = useQuery({
    queryFn: async () => {
      return await getOrCreateStaffMatch({ staffId, userId });
    },
    queryKey: QUERY_KEYS.staff.match({ staffId, userId }),
    enabled: enabled && !!staffId && !!userId,
  });

  return {
    matchId: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const fetchStaffMatch = getOrCreateStaffMatch;
