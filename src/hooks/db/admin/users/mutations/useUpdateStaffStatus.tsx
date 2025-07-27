import { useMutation } from '@tanstack/react-query';

import { SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export function useUpdateStaffStatus(options?: {
  onSuccess?: (status: 'accepted' | 'declined') => void;
  onError?: (err: any) => void;
}) {
  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: 'accepted' | 'declined';
    }) => {
      const payload = {
        userId,
        newAppMetadata: { staff_status: status },
        path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminUpdateUserAppmeta,
      };
      const result = await invokeSupabaseFunction(
        SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
        { body: payload },
      );
      if (result.error) {
        throw result.error;
      }
      return status;
    },
    ...options,
  });
}
