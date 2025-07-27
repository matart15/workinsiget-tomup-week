import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { QUERY_KEYS, SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export const fetchStaffs = async ({ from, to }: { from: number; to: number }) => {
  const payload = {
    path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminListUsersByRole,
    role: 'staff',
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

export const useStaffs = () => {
  return usePaginatedQuery({
    queryFn: fetchStaffs,
    queryKey: ({ from, to }) => [...QUERY_KEYS.usersByRole({ role: 'staff' }), from, to],
  });
};
