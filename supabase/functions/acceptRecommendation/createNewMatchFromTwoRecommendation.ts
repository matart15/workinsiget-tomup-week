import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../_shared/database.ts";

export async function createNewMatchFromTwoRecommendation({
  recommendation_id,
  supabaseAdmin,
  otherUserId,
  currentUserId,
  otherUserRecommendationId,
}: {
  recommendation_id: number;
  supabaseAdmin: SupabaseClient<Database>;
  otherUserId: string;
  currentUserId: string;
  otherUserRecommendationId: number;
}) {
  const { error: matchError } = await supabaseAdmin.from("u_matches").insert({
    user1_id: currentUserId,
    user2_id: otherUserId,
  });

  if (matchError) {
    throw matchError;
  }

  //remove recommendation
  const { error: deleteRecommendationError } = await supabaseAdmin
    .from("u_recommendations")
    .delete()
    .eq("id", recommendation_id);

  if (deleteRecommendationError) {
    throw deleteRecommendationError;
  }
  // remove other user recommendation
  const { error: deleteOtherUserRecommendation } = await supabaseAdmin
    .from("u_recommendations")
    .delete()
    .eq("id", otherUserRecommendationId);

  if (deleteOtherUserRecommendation) {
    throw deleteOtherUserRecommendation;
  }
}
