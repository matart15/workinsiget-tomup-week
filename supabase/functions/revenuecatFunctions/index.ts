import { z } from "zod";
import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { CustomError } from "../_shared/errorResponse.ts";
import { dataResponse } from "../_shared/dataResponse.ts";
import { getAuthUser } from "../_shared/supabaseClient.ts";

const FUNCTION_NAME = "revenuecatFunctions";
console.log(`Hello from ${FUNCTION_NAME}!`);
const validateArgs = ({ args }: { args: any }) => {
  const schema = z.object({
    app_user_id: z.string(),
  });
  const parsedArgs = schema.safeParse(args);
  if (!parsedArgs.success) {
    throw new Error(`${FUNCTION_NAME}: Invalid args`);
  }
  return parsedArgs.data;
};
Deno.serve(async (req) => {
  console.log("🚀 ~ req:", req);
  // 1. get current user id and validate args
  // const currentUserId = await _internals.getAuthUserId(req);
  const args = await req.json();
  console.log("🚀 ~ args:", args);
  const supabaseAdmin = getSupabaseAdmin();
  const { app_user_id } = validateArgs({
    args,
  });
  const currentUser = await getAuthUser(req);
  const updateSupabaseUserResult = await supabaseAdmin
    .from("users")
    .update({
      revenuecat_app_user_id: app_user_id,
    })
    .eq("id", currentUser.id);
  await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
    app_metadata: {
      revenuecat_app_user_id: app_user_id,
    },
  });
  if (updateSupabaseUserResult.error) {
    return new CustomError("REVENUECAT_UPDATE_USER_FAILED", {
      extra: args,
    }).errorResponse();
  }
  return dataResponse({
    status: "ok",
  });
});
