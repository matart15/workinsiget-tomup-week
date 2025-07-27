import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { QUERY_KEYS } from '@/lib/const';
import { supabase } from '@/lib/supabase';

const accountSchema = z.object({
  account_id: z.string(),
  account_role: z.string(),
  is_primary_owner: z.boolean(),
  name: z.string(),
  slug: z.string().nullable(),
  personal_account: z.boolean(),
  billing_enabled: z.boolean(),
  billing_status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  metadata: z.record(z.string(), z.string()),
});
export const useLoadMyAccount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myAccount(),
    queryFn: async () => {
      const { data: supabaseUser } = await supabase.auth.getUser();
      if (!supabaseUser.user) {
        throw new Error('No user found');
      }
      const { data, error } = await supabase.rpc('get_personal_account');

      if (error) {
        throw error;
      }

      const parsedAccount = accountSchema.safeParse(data);
      if (!parsedAccount.success) {
        throw new Error('Invalid account data', { cause: parsedAccount.error });
      }

      return parsedAccount.data;
    },
  });
};
