import { useQuery } from '@tanstack/react-query';

import { SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export const fetchUserById = async (id: string) => {
  if (!id) {
    return null;
  }
  // Fetch user from public.users
  const { data: roleData, error: roleError } = await invokeSupabaseFunction(
    SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
    {
      body: {
        path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminGetUserData,
        userId: id,
      },
    },
  );
  // @ts-expect-error its troublesome to hardcode supabase user type
  if (roleError || !roleData?.user) {
    throw roleError;
  }
  // @ts-expect-error its troublesome to hardcode supabase user type
  return roleData?.user;
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ['userById', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
};
