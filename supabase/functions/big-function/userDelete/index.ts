import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getAuthUser, getAuthUserId } from "../../_shared/supabaseClient.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { Stripe } from "https://esm.sh/stripe@14.10.0";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";

const FUNCTION_NAME = "userDelete" as const satisfies BigFunctionPaths;
const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;
const inputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema = validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;
console.log(`Hello from ${FUNCTION_NAME}!`);
export const _internals = {
  getAuthUserId,
  getSupabaseAdmin,
};

const stripeApiKey = Deno.env.get("STRIPE_API_KEY");
if (!stripeApiKey) {
  throw new Error("Missing STRIPE_API_KEY env var");
}
const stripe = new Stripe(stripeApiKey, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});
export const userDelete = async ({ req, args }: { args: any; req: Request }) => {
  // 1. get current user id and validate args
  // const currentUserId = await _internals.getAuthUserId(req);
  validateArgs({ args, schema: inputSchema });
  const supabaseAdmin = _internals.getSupabaseAdmin();
  const currentUser = await getAuthUser(req);

  console.log(
    "user app_metadata",
    currentUser.app_metadata["stripe_subscription_id"],
  );
  if (currentUser.app_metadata["stripe_subscription_id"]) {
    const subscriptionUpdateResponse = await stripe.subscriptions.update(
      currentUser.app_metadata["stripe_subscription_id"],
      {
        cancel_at_period_end: true,
      },
    );
    console.log("🚀 ~ subscriptionUpdateResponse:", subscriptionUpdateResponse);
  }
  const deleteUserResult = await supabaseAdmin.auth.admin.deleteUser(
    currentUser.id,
  );
  if (deleteUserResult.error) {
    throw new CustomError("CANT_DELETE_APP_USER", {
      extra: deleteUserResult.error,
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
