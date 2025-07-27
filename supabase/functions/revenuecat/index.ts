// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomError } from "../_shared/errorResponse.ts";
import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";

async function checkProcessedEvent({
  eventId,
  supabaseAdmin,
}: {
  supabaseAdmin: SupabaseClient;
  eventId: string;
}) {
  const { data } = await supabaseAdmin
    .from("revenue_cat_processed_events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  return !!data; // Return true if event ID exists, false otherwise
}

async function storeProcessedEvent({
  eventId,
  event_timestamp_ms,
  supabaseAdmin,
}: {
  supabaseAdmin: SupabaseClient;
  event_timestamp_ms: number;
  eventId: string;
}) {
  await supabaseAdmin
    .from("revenue_cat_processed_events")
    .insert([{ id: eventId, timestamp: event_timestamp_ms }]);
}

async function cleanUpOldProcessedEvents({
  supabaseAdmin,
}: {
  supabaseAdmin: SupabaseClient;
}) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

  await supabaseAdmin
    .from("processed_events")
    .delete()
    .lt("timestamp", oneWeekAgo);
}

const getRevenueCatCustomerDetail = async ({
  app_user_id,
}: {
  app_user_id: string;
}) => {
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${app_user_id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("REVENUECAT_API_KEY") || ""}`,
      },
    },
  );
  const data = await response.json();
  return data;
};

console.log("Hello from Functions!");

Deno.serve(async (req: Request) => {
  const args = await req.json();

  const { event } = args;
  console.log("🚀 ~ event:", event);
  const supabaseAdmin = getSupabaseAdmin();
  // Check if event ID is already processed
  const isProcessed = await checkProcessedEvent({
    eventId: event.id,
    supabaseAdmin,
  });
  if (isProcessed) {
    console.log("Event already processed", event.id);
    return new Response("Event already processed", { status: 200 });
  }

  const supabaseUser = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("revenuecat_app_user_id", event.app_user_id)
    .maybeSingle();
  if (!supabaseUser.data) {
    throw new CustomError("REVENUECAT_APP_USER_ID_NOT_SAVED_BEFORE_WEBHOOK", {
      extra: event,
    });
  }
  const currentUser = supabaseUser.data;
  console.log("🚀 ~ currentUser:", currentUser);

  const revenuecatUserDetail = await getRevenueCatCustomerDetail({
    app_user_id: event.app_user_id,
  });
  console.log("revenuecatUserDetail", revenuecatUserDetail);
  // Update user data and process payment (if applicable)
  // const updateUserResult = await supabaseAdmin
  //   .from("users")
  //   .update({
  //     revenuecat_app_user_id: event.app_user_id,
  //   })
  //   .eq("id", currentUser.id);
  const updateUserMetadataResult =
    await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
      app_metadata: {
        revenuecat_subscription_product_id:
          revenuecatUserDetail.subscriber.entitlements.paid_user
            .product_identifier,
      },
    });
  console.log("🚀 ~ updateUserMetadataResult:", updateUserMetadataResult);

  // Store processed event ID with timestamp
  await storeProcessedEvent({
    eventId: event.id,
    event_timestamp_ms: Date.now(),
    supabaseAdmin,
  });

  // Clean up old processed event IDs (optional)
  cleanUpOldProcessedEvents({
    supabaseAdmin,
  });

  return new Response(JSON.stringify(args), {
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
