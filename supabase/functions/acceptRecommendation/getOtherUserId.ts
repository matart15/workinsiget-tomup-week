import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../_shared/database.ts";

export const getOtherUserId = async ({
  recommendation_id,
  supabaseAdmin,
  currentUserId,
}: {
  recommendation_id: number;
  supabaseAdmin: SupabaseClient<Database>;
  currentUserId: string;
}) => {
  // check recommendation exists on recommendation table
  const recommendation = await supabaseAdmin
    .from("u_recommendations")
    .select("*")
    .eq("id", recommendation_id)
    .single();
  if (recommendation.error) {
    throw recommendation.error;
  }

  if (recommendation.data.user1_id === currentUserId) {
    return recommendation.data.user2_id;
  }
  return recommendation.data.user1_id;
};
