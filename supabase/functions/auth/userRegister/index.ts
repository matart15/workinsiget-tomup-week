import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getUserRegistrationSchema } from "../../_shared/validation/index.ts";
import { dataResponse } from "../../_shared/dataResponse.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../../_shared/supabaseClient.ts";
import { createMatchingWithSupportAccount } from "./createMatchingWithSupportAccount.ts";

const FUNCTION_NAME = "userRegister";
console.log(`Hello from ${FUNCTION_NAME}!`);
export const _internals = {
  getAuthUserId,
  getSupabaseAdmin,
  getUserRegistrationSchema,
  createMatchingWithSupportAccount,
};

const validateArgs = ({ args }: { args: any }) => {
  const schema = _internals.getUserRegistrationSchema(z);
  const parsedArgs = schema.safeParse(args);
  if (!parsedArgs.success) {
    throw new Error(`${FUNCTION_NAME}: Invalid args`);
  }
  return parsedArgs.data;
};

export const userRegister = async ({ args }: { args: any; req: Request }) => {
  // 1. get current user id and validate args
  // const currentUserId = await _internals.getAuthUserId(req);
  const supabaseAdmin = _internals.getSupabaseAdmin();
  const { emailAddress, password, invited_by } = validateArgs({
    args,
  });
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
  // create match with support account
  await _internals.createMatchingWithSupportAccount({
    currentUserId: id,
    supabaseAdmin,
  });
  return dataResponse({
    status: "ok",
  });
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/userRegister' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
