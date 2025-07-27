import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { QUERY_KEYS, SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export const fetchManagers = async ({ from, to }: { from: number; to: number }) => {
  const payload = {
    path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminListUsersByRole,
    role: 'manager',
    from,
    to,
  };
  const { data, error } = await invokeSupabaseFunction(
    SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
    { body: payload },
  );
  if (error) {
    throw error;
  }
  return { users: data?.users ?? [], count: data?.count ?? 0 };
};

export const useManagers = () => {
  return usePaginatedQuery({
    queryFn: fetchManagers,
    queryKey: ({ from, to }) => [...QUERY_KEYS.usersByRole({ role: 'manager' }), from, to],
  });
};
