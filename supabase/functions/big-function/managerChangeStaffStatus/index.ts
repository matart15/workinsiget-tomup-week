import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { getAuthUser } from "../../_shared/supabaseClient.ts";
import { CustomError } from "../../_shared/errorResponse.ts";

const FUNCTION_NAME = "managerChangeStaffStatus" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const managerChangeStaffStatus = async ({ req, args }: { req: Request; args: unknown }) => {
  console.log(`${FUNCTION_NAME} called`, args);
  const currentUser = await getAuthUser(req);
  if (!["admin", "staff"].includes(currentUser.app_metadata?.role)) {
    throw new CustomError("UNAUTHORIZED", { extra: "Not admin or staff" });
  }
  const validatedArgs = validateArgs({ args, schema: inputSchema });
  const { targetUserId, status } = validatedArgs;
  const supabaseAdmin = getSupabaseAdmin();
  // get user
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
  if (error || !user) {
    throw new CustomError("NOT_FOUND", { extra: error || targetUserId });
  }
  if (user.app_metadata?.role && user.app_metadata?.role !== "staff" ) {
    // normal user does not have role
    throw new CustomError("VALIDATION_ERROR", { extra: "User is not a staff or normal" });
  }
  // update app_metadata.staff_status
  let newAppMeta = { ...user.app_metadata };
  if (status) {
    newAppMeta.staff_status = status;
    newAppMeta.role = "staff";
  } else {
    // remove staff_status
    // deno-lint-ignore no-unused-vars
    const { staff_status, role, ...restMeta } = newAppMeta;
    newAppMeta = restMeta;
  }
  const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    app_metadata: newAppMeta,
  });
  if (updateMetaError) {
    throw new CustomError("VALIDATION_ERROR", { extra: updateMetaError });
  }
  // update users.staff_status
  const { error: updateProfileError } = await supabaseAdmin.from("users").update({ staff_status: status ?? null }).eq("id", targetUserId);
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
