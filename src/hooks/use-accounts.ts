import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const useAccounts = () => {
  const result = useQuery({
    queryKey: ['get_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_accounts');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  return result;
};
