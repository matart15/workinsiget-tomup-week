import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../_shared/database.ts";

export async function getOtherUserRecommendation({
  supabaseAdmin,
  otherUserId,
  currentUserId,
}: {
  supabaseAdmin: SupabaseClient<Database>;
  otherUserId: string;
  currentUserId: string;
}) {
  const otherUserRecommendation = await supabaseAdmin
    .from("u_recommendations")
    .select("*")
    .eq("user1_id", otherUserId)
    .eq("user2_id", currentUserId)
    .eq("status", "ACCEPTED")
    .limit(1);

  if (otherUserRecommendation.error) {
    throw otherUserRecommendation.error;
  }

  if (otherUserRecommendation.data.length > 1) {
    throw new Error(
      "otherUserRecommendation.data.length is more than 1, this should not happen",
    );
  }
  return otherUserRecommendation;
}
