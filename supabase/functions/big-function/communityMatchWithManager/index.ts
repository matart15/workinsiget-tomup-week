import { CustomError } from "../../_shared/errorResponse.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../../_shared/supabaseClient.ts";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const FUNCTION_NAME = "communityMatchWithManager" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const _internals = {
  getAuthUserId,
  // getAuthUser,
  getSupabaseAdmin,
  communityMatchWithManagerSchema: z.any(), // This will be removed as per the new_code, but keeping it for now as it's not explicitly removed.
};

export const communityMatchWithManager = async ({
  req,
  args,
}: {
  args: any;
  req: Request;
}) => {
  console.log(`${FUNCTION_NAME} called`, args);
  // 1. get current user id
  const currentUserId = await _internals.getAuthUserId(req);

  // 2. validate input
  const validatedArgs = validateArgs({ args, schema: inputSchema });
  const { communityId, managerId } = validatedArgs;
  if (managerId === currentUserId) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: `Cannot match with yourself`,
    });
  }

  // 3. check community exists
  const supabaseAdmin = _internals.getSupabaseAdmin();
  const tableUpdateResult = await supabaseAdmin
    .from("c_community")
    .select("*")
    .eq("id", communityId)
    .eq("manager_id", managerId);
  if (tableUpdateResult.error) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: tableUpdateResult.error,
    });
  }
  if (!tableUpdateResult.data?.length) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: `No community found with id ${communityId} and manager_id ${managerId}`,
    });
  }

  // 4. check if already matched
  const matchFromUser = await supabaseAdmin
    .from("u_matches")
    .select("*")
    .eq("user1_id", currentUserId)
    .eq("user2_id", managerId);
  const matchFromManager = await supabaseAdmin
    .from("u_matches")
    .select("*")
    .eq("user1_id", managerId)
    .eq("user2_id", currentUserId);
  if (matchFromUser.data?.length || matchFromManager.data?.length) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: `You already matched with ${managerId}`,
    });
  }

  // 5. match
  const insertResult = await supabaseAdmin
    .from("u_matches")
    .insert({
      user1_id: currentUserId,
      user2_id: managerId,
    })
    .select();
  if (insertResult.error) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: insertResult.error,
    });
  }
  const parsedOutput = outputSchema.safeParse(insertResult.data);
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", { extra: parsedOutput.error });
  }
  return parsedOutput.data;
};
