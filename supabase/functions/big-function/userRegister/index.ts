import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";
import { getAuthUserId } from "../../_shared/supabaseClient.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { CustomError } from "../../_shared/errorResponse.ts";

const FUNCTION_NAME = "userRegister" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

console.log(`Hello from ${FUNCTION_NAME}!`);
export const _internals = {
  getAuthUserId,
  getSupabaseAdmin,
  getUserRegistrationSchema: (z: typeof import("https://deno.land/x/zod@v3.22.4/mod.ts")) =>
    validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema,
};

export const userRegister = async ({ args }: { args: any; req: Request }) => {
  // 1. get current user id and validate args
  // const currentUserId = await _internals.getAuthUserId(req);
  const supabaseAdmin = _internals.getSupabaseAdmin();
  const { emailAddress, password, invited_by } = validateArgs({ args, schema: inputSchema });
  const supabaseCreateUserResult = await supabaseAdmin.auth.signUp({
    email: emailAddress,
    password,
  });
  if (supabaseCreateUserResult.error) {
    throw new CustomError("CANT_CREATE_SUPABASE_USER", {
      extra: supabaseCreateUserResult.error,
    });
  }
  const id = supabaseCreateUserResult.data.user?.id;
  if (!id) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", {
      extra: supabaseCreateUserResult.error,
    });
  }
  // create public user
  const publicUserInsertResult = await supabaseAdmin.from("users").insert([
    {
      id,
      email: emailAddress,
      invited_by,
    },
  ]);
  if (publicUserInsertResult.error) {
    throw new CustomError("CANT_CREATE_APP_USER", {
      extra: publicUserInsertResult.error,
    });
  }
  const result = { status: "ok" };
  const parsedOutput = outputSchema.safeParse(result);
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", { extra: parsedOutput.error });
  }
  return parsedOutput.data;
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/userRegister' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
