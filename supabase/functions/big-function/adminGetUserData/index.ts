import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getAuthUser } from "../../_shared/supabaseClient.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";

const FUNCTION_NAME = "adminGetUserData" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;

const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const adminGetUserData = async ({ req, args }: { req: Request; args: unknown }) => {
  console.log(`${FUNCTION_NAME} called`, args);
  const currentUser = await getAuthUser(req);
  if (currentUser.app_metadata?.role !== "admin") {
    throw new CustomError("UNAUTHORIZED", { extra: "Not admin" });
  }
  const validatedArgs = validateArgs({ args, schema: inputSchema });
  const { userId } = validatedArgs;
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    throw new CustomError("NOT_FOUND", { extra: error || "User not found" });
  }
  // Fetch public.users row for this ID
  const { data: publicUser, error: publicUserError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (publicUserError) {
    throw new CustomError("NOT_FOUND", { extra: publicUserError });
  }
  const userWithProfile = {
    ...data.user,
    profile: publicUser ?? null,
  };
  const parsedOutput = outputSchema.safeParse({ user: userWithProfile });
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", {
      extra: parsedOutput.error,
    });
  }
  return parsedOutput.data;
}; 
