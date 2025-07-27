// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// Looks like npm import is not supported by supabase
// https://github.com/supabase/supabase/issues/10403#issuecomment-1325489369
// import Stripe from "npm:stripe@14.1.0";
// for now we use import_map just like this:
import { User } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@14.10.0";
import { CustomError } from "../../_shared/errorResponse.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";

const InputSchema = z.object({
  priceId: z.string(),
});

export const subscribe = async (
  {
    stripe,
    customer,
    currentUser,
  }: {
    stripe: Stripe;
    customer: Stripe.Customer;
    currentUser: User;
  },
  params: any,
) => {
  // 1. validate input
  const parseResult = InputSchema.safeParse(params);
  if (!parseResult.success) {
    throw new CustomError("VALIDATION_ERROR", {
      extra: parseResult.error,
    });
  }
  const { priceId } = parseResult.data;

  // 2. get customer subscription from stripe.
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    expand: ["data.plan"],
  });
  if (subscriptions.data.length > 2) {
    // currently we are not planning to have multiple subscriptions
    throw new CustomError("STRIPE_TOO_MANY_SUBSCRIPTIONS", {
      extra: subscriptions.data,
    });
  }
  const subscriptionWithSamePriceId = subscriptions.data.find(
    // @ts-expect-error somehow plan is not in the type
    (sub) => sub.plan.id === priceId,
  );
  if (subscriptionWithSamePriceId) {
    // user is already subscribed with same priceId
    throw new CustomError("STRIPE_SUBSCRIPTION_ALREADY_EXISTS");
  }
  if (subscriptions.data.length > 0) {
    // user is already subscribed with different priceId
    // we should change subscription
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: "card",
  });
  if (paymentMethods.data.length === 0) {
    throw new CustomError("STRIPE_PAYMENT_METHOD_NOT_FOUND");
  }
  const subscription = await stripe.subscriptions.create({
    currency: "jpy",
    customer: customer.id,
    // payment_method_types: [
    //   "card",
    // ],
    default_payment_method: paymentMethods.data[0].id,
    collection_method: "charge_automatically",
    payment_behavior: "error_if_incomplete",
    items: [
      {
        price: priceId,
      },
    ],
  });
  console.log("🚀 ~ subscription:", subscription);
  const supabaseAdmin = getSupabaseAdmin();
  console.log(
    "🚀 ~ subscription.plan.id:",
    currentUser.id,
    // @ts-expect-error somehow plan is not in the type
    subscription.plan.id,
  );

  const updateUserResult = await supabaseAdmin
    .from("users")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
    })
    .eq("id", currentUser.id);
  console.log("🚀 ~ updateUserResult:", updateUserResult);
  const updateUserMetadataResult =
    await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
      app_metadata: {
        // @ts-expect-error somehow plan is not in the type
        stripe_subscription_price: subscription.plan.id,
      },
    });
  console.log("🚀 ~ updateUserMetadataResult:", updateUserMetadataResult);

  return subscription;
};
