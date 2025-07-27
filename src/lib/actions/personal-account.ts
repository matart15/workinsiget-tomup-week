import { useQuery } from '@tanstack/react-query';

import { supabase } from '../supabase';

export async function editPersonalAccountName(name: string) {
  return {};
}
export const getPersonalAccount = async () => {
  const { data, error } = await supabase.rpc('get_personal_account');
  if (error || !data) {
    throw new Error('No personal account found 333');
  }
  return data;
};
export const usePersonalAccount = () => {
  return useQuery({
    queryKey: ['personal-account'],
    queryFn: getPersonalAccount,
  });
};
