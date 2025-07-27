import { useMutation } from '@tanstack/react-query';

import { SUPABASE_FUNCTION_NAMES } from '@/lib/const';
import { invokeSupabaseFunction } from '@/lib/invokeSupabaseFunction';

export const updateUserPlan = async ({
  userId,
  plan,
}: {
  userId: string;
  plan: string | null;
}) => {
  const payload = {
    path: SUPABASE_FUNCTION_NAMES.bigFunction.paths.adminUpdateUserAppmeta,
    userId,
    newAppMetadata: { revenuecat_subscription_product_id: plan },
  };
  const result = await invokeSupabaseFunction(
    SUPABASE_FUNCTION_NAMES.bigFunction.functionName,
    { body: payload },
  );
  if (result.error) {
    throw new Error(result.error.displayMessage || 'Failed to update user plan');
  }
  return result.data;
};

export function useUpdateUserPlan() {
  return {
    updateUserPlan: useMutation({
      mutationFn: async ({ userId, plan }: { userId: string; plan: string | null }) =>
        updateUserPlan({ userId, plan }),
    }).mutateAsync,
  };
}
