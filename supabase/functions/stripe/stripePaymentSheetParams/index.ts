// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { Stripe } from "https://esm.sh/stripe@14.10.0";

console.log("Hello from Functions!");

export const stripePaymentSheetParams = async ({
  stripe,
  customer,
}: {
  stripe: Stripe;
  customer: Stripe.Customer;
}) => {
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-08-16" },
  );
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
  });

  return {
    customer: customer.id,
    ephemeralKey: ephemeralKey.secret,
    setupIntent: setupIntent.client_secret,
  };
};

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
