import { useMutation } from '@tanstack/react-query';

import { SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export function useSetUserRole(options?: {
  onSuccess?: (role: string) => void;
  onError?: (err: any) => void;
}) {
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      if (!userId) {
        throw new Error('No user id');
      }
      const payload = {
        path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminUpdateUserAppmeta,
        userId,
        newAppMetadata: { role, staff_status: role === 'staff' ? true : null },
      };
      const result = await invokeSupabaseFunction(
        SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
        { body: payload },
      );
      if (result.error) {
        throw new Error(result.error.displayMessage || 'Failed to set role');
      }
      return role;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
