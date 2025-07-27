import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../../_shared/supabaseClient.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const FUNCTION_NAME = "staffRequest" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const staffRequest = async ({ req, args }: { req: Request; args: unknown }) => {
  console.log(`${FUNCTION_NAME} called`, args);
  validateArgs({ args, schema: inputSchema });
  const supabaseAdmin = getSupabaseAdmin();
  const callerUserId = await getAuthUserId(req);
  if (!callerUserId) {
    throw new CustomError("UNAUTHORIZED", { extra: "Not logged in" });
  }
  // 1. get self user
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(callerUserId);
  if (error || !user) {
    throw new CustomError("NOT_FOUND", { extra: error || callerUserId });
  }
  const staffStatus = user.app_metadata?.staff_status;
  if (staffStatus && staffStatus !== "requested") {
    throw new CustomError("VALIDATION_ERROR", { extra: staffStatus });
  }
  if (staffStatus === "requested") {
    const result = true;
    const parsedOutput = outputSchema.safeParse(result);
    if (!parsedOutput.success) {
      throw new CustomError("THIS_SHOULD_NOT_HAPPEN", { extra: parsedOutput.error });
    }
    return parsedOutput.data;
  }
  // 3. set to requested
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(callerUserId, {
    app_metadata: {
      ...user.app_metadata,
      staff_status: "requested",
      role: "staff",
    },
  });
  if (updateError) {
    throw new CustomError("VALIDATION_ERROR", { extra: updateError });
  }
  // update users.staff_status to 'requested'
  const { error: updateProfileError } = await supabaseAdmin.from("users").update({ staff_status: "requested" }).eq("id", callerUserId);
  if (updateProfileError) {
    throw new CustomError("VALIDATION_ERROR", { extra: updateProfileError });
  }
  const result = true;
  const parsedOutput = outputSchema.safeParse(result);
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", { extra: parsedOutput.error });
  }
  return parsedOutput.data;
}; 
