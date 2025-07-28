import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type UserActivityLog = {
  id: string;
  profile_id: string;
  url: string;
  title: string | null;
  duration: number;
  timestamp: number;
  created_at: string;
  updated_at: string;
};

export type GetUserActivityLogsParams = {
  profileId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
};

export const useGetUserActivityLogs = (params: GetUserActivityLogsParams) => {
  const { profileId, limit = 100, offset = 0, startDate, endDate } = params;

  return useQuery({
    queryKey: ['user-activity-logs', profileId, limit, offset, startDate, endDate],
    queryFn: async (): Promise<UserActivityLog[]> => {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch user activity logs: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!profileId,
  });
};
