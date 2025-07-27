import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { QUERY_KEYS, SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export const fetchUsers = async ({ from, to }: { from: number; to: number }) => {
  console.log('🚀 ~ fetchUsers ~ pagination params:', { from, to });
  const payload = {
    path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminListUsersByRole,
    role: 'user',
    from,
    to,
  };
  console.log('🚀 ~ fetchUsers ~ payload:', payload);
  const { data, error } = await invokeSupabaseFunction(
    SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
    { body: payload },
  );
  if (error) {
    throw error;
  }
  console.log('🚀 ~ fetchUsers ~ full response:', data);
  console.log('🚀 ~ fetchUsers ~ response:', { usersCount: (data as any)?.users?.length, count: (data as any)?.count });
  return { users: (data as any)?.users ?? [], count: (data as any)?.count ?? 0 };
};

export const useUsers = () => {
  return usePaginatedQuery({
    queryFn: fetchUsers,
    queryKey: ({ from, to }) => [...QUERY_KEYS.usersByRole({ role: 'user' }), from, to],
  });
};
