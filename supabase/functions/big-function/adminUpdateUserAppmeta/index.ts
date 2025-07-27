import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

import { CustomError } from '../../_shared/errorResponse.ts';
import { getSupabaseAdmin } from '../../_shared/supabaseAdmin.ts';
import { getAuthUser } from '../../_shared/supabaseClient.ts';
import { deepMerge } from '../../_shared/utils.ts';
import type { BigFunctionPaths, ValidationSchema } from '../../_shared/validation.ts';
import { validateArgs, validationSchema } from '../../_shared/validation.ts';

const FUNCTION_NAME = 'adminUpdateUserAppmeta' as const satisfies BigFunctionPaths;
const GROUP_NAME = 'big-function' as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const _internals = {
  getAuthUser,
  getSupabaseAdmin,
};

export const adminUpdateUserAppmeta = async ({ req, args }: { req: Request; args: unknown }) => {
  console.log(`${FUNCTION_NAME} called`, args);
  // 1. get current user and check have permission
  const currentUser = await _internals.getAuthUser(req);
  if (!['admin'].includes(currentUser.app_metadata?.role)) {
    throw new CustomError('UNAUTHORIZED', { extra: 'Not admin' });
  }
  // 2. validate input
  const validatedArgs = validateArgs({ args, schema: inputSchema });
  const { userId, newAppMetadata } = validatedArgs;
  // 3. get current app_metadata
  const supabaseAdmin = _internals.getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !user) {
    throw new CustomError('NOT_FOUND', { extra: error || userId });
  }
  const currentAppMeta: Record<string, unknown> = user.app_metadata || {};
  // 4. deep merge
  const merged = deepMerge(currentAppMeta, newAppMetadata);
  // 5. save merged data
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { app_metadata: merged });
  if (updateError) {
    throw new CustomError('REVENUECAT_UPDATE_USER_FAILED', { extra: updateError });
  }
  // 6. return true
  const result = true;
  const parsedOutput = outputSchema.safeParse(result);
  if (!parsedOutput.success) {
    throw new CustomError('THIS_SHOULD_NOT_HAPPEN', { extra: parsedOutput.error });
  }
  return parsedOutput.data;
};
