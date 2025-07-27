import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getAuthUser, getAuthUserId } from "../../_shared/supabaseClient.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { dataResponse } from "../../_shared/dataResponse.ts";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";

const FUNCTION_NAME = "adminUpdateUser" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;

const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const _internals = {
  getAuthUserId,
  getAuthUser,
  getSupabaseAdmin,
};


export const adminUpdateUser = async ({
  req,
  args,
}: {
  args: any;
  req: Request;
}) => {
  console.log(`${FUNCTION_NAME} called`, args);
  // 1. get current user id
  // const currentUserId = await _internals.getAuthUserId(req);
  // Use shared validation logic
  const validatedArgs = validateArgs({ args, schema: inputSchema });

  const supabaseAdmin = _internals.getSupabaseAdmin();
  const currentUser = await _internals.getAuthUser(req);

  const { role, ...updateParams } = validatedArgs;
  const tableUpdateResult = await supabaseAdmin
    .from("users")
    .update(updateParams)
    .eq("id", currentUser.id)
    .select("*");
  if (tableUpdateResult.error) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: tableUpdateResult.error,
    });
  }
  const roleUpdateResult = await supabaseAdmin.auth.admin.updateUserById(
    currentUser.id,
    {
      app_metadata: {
        ...currentUser.app_metadata,
        role,
      },
    },
  );
  if (roleUpdateResult.error) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: roleUpdateResult.error,
    });
  }
  const result = true;
  const parsedOutput = outputSchema.safeParse(result);
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", { extra: parsedOutput.error });
  }
  return parsedOutput.data;
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/adminUpdateUser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
