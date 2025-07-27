// This function will handle all stripe relate requests
// use path param to determine which stripe api to call

import { InputTypeOfTuple, z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// Looks like npm import is not supported by supabase
// https://github.com/supabase/supabase/issues/10403#issuecomment-1325489369
// import Stripe from "npm:stripe@14.1.0";
// for now we use import_map just like this:
import { Stripe } from "https://esm.sh/stripe@14.10.0";

import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getAuthUser } from "../_shared/supabaseClient.ts";
import { stripePaymentSheetParams } from "./stripePaymentSheetParams/index.ts";
import { subscribe } from "./subscribe/index.tsx";
import { CustomError } from "../_shared/errorResponse.ts";
import { assertNever } from "../_shared/assertNever.ts";
import { dataResponse } from "../_shared/dataResponse.ts";

console.log("Hello from Functions!");

const InputSchema = z.object({
  path: z.union([
    z.literal("stripePaymentSheetParams"),
    z.literal("subscribe"),
  ]),
});

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

const pathSelector = (path: z.infer<typeof InputSchema>["path"]) => {
  switch (path) {
    case "stripePaymentSheetParams":
      return stripePaymentSheetParams;
    case "subscribe":
      return subscribe;
    default:
      return assertNever(path);
  }
};

async function createStripeCustomer({
  email,
  currentUserId,
}: {
  email?: string;
  currentUserId: string;
}) {
  const newCustomer = await stripe.customers.create({
    email,
    // payment_method: "pmc_1NyuTFFomPAn6jLwnQj3mbz4",
    // invoice_settings: {
    //   default_payment_method: "pmc_1NyuTFFomPAn6jLwnQj3mbz4",
    // },
  });
  const supabaseAdmin = getSupabaseAdmin();
  const updateUserResult = await supabaseAdmin.auth.admin.updateUserById(
    currentUserId,
    {
      app_metadata: {
        stripe_customer_id: newCustomer.id,
      },
    },
  );
  return newCustomer;
}

Deno.serve(async (req) => {
  try {
    const { path, ...rest } = await req.json();
    const parseResult = InputSchema.safeParse({
      path,
    });
    if (!parseResult.success) {
      return new CustomError("VALIDATION_ERROR", {
        extra: parseResult.error,
      }).errorResponse();
    }
    const handlerFunction = pathSelector(parseResult.data.path);
    if (!handlerFunction) {
      return new CustomError("VALIDATION_ERROR", {
        extra: { path },
      }).errorResponse();
    }
    const currentUser = await getAuthUser(req);
    const email = currentUser?.email;
    const stripeCustomerId = currentUser?.app_metadata?.stripe_customer_id;
    let customer: Stripe.Response<
      Stripe.Customer | Stripe.DeletedCustomer
    > | null = null;
    if (!stripeCustomerId) {
      customer = await createStripeCustomer({
        email,
        currentUserId: currentUser.id,
      });
    } else {
      customer = await stripe.customers.retrieve(stripeCustomerId, {
        expand: ["subscriptions"],
      });
      if (customer.deleted) {
        return new CustomError("STRIPE_CUSTOMER_DELETED", {
          extra: { stripeCustomerId, email },
        }).errorResponse();
      }
      // const customersResult1 = await stripe.customers.retrieve({ email });
      if (!customer) {
        customer = await createStripeCustomer({
          email,
          currentUserId: currentUser.id,
        });
      }
    }

    const data = await handlerFunction({ stripe, customer, currentUser }, rest);

    return dataResponse(data);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
