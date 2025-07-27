import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { dataResponse } from "../_shared/dataResponse.ts";

import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../_shared/supabaseClient.ts";
import { getUserRegistrationSchema } from "../_shared/validation/index.ts";
import { CustomError } from "../_shared/errorResponse.ts";

console.log(`Hello from staffRegister`);
export const _internals = {
  getAuthUserId,
  getSupabaseAdmin,
  getUserRegistrationSchema,
};

const validateArgs = ({ args }: { args: any }) => {
  const schema = _internals.getUserRegistrationSchema(z);
  const parsedArgs = schema.safeParse(args);
  if (!parsedArgs.success) {
    throw new CustomError("VALIDATION_ERROR");
  }
  // const { recommendation_id } = args;
  // if (!recommendation_id) throw new Error("No recommendation_id found");
  // if (typeof recommendation_id !== "number")
  //   throw new Error("recommendation_id is not number");

  return parsedArgs.data;
};

Deno.serve(async (req) => {
  try {
    // 1. get current user id and validate args
    // const currentUserId = await _internals.getAuthUserId(req);
    const args = await req.json();
    const supabaseAdmin = _internals.getSupabaseAdmin();
    const { emailAddress, password } = validateArgs({
      args,
    });
    const supabaseCreateUserResult = await supabaseAdmin.auth.signUp({
      email: emailAddress,
      password,
    });
    if (supabaseCreateUserResult.error) {
      return new CustomError("CANT_CREATE_SUPABASE_USER", {
        extra: supabaseCreateUserResult.error,
      }).errorResponse();
    }
    const id = supabaseCreateUserResult.data.user?.id;
    if (!id) {
      return new CustomError("THIS_SHOULD_NOT_HAPPEN").errorResponse();
    }
    // create public staff
    const publicStaffInsertResult = await supabaseAdmin
      .from("s_staffs")
      .insert([
        {
          id,
        },
      ]);
    if (publicStaffInsertResult.error) {
      return new CustomError("CANT_CREATE_APP_USER", {
        extra: publicStaffInsertResult.error,
      }).errorResponse();
    }
    return dataResponse({
      status: "ok",
    });
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return error.errorResponse();
    }
    return new CustomError("UNHANDLED", {
      extra: error,
    }).errorResponse();
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/staffRegister' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
