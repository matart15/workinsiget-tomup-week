// free plan: 10 recommendations per month
// standard plan: 5 recommendations per day
// premium plan: 10 recommendations per day

import dayjs from "https://cdn.skypack.dev/dayjs";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../_shared/database.ts";

export async function getIsRecommendationCountReached({
  supabaseAdmin,
  currentUserId,
}: {
  supabaseAdmin: SupabaseClient<Database>;
  currentUserId: string;
}): Promise<boolean> {
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("revenuecat_app_user_id, recommendation_usage")
    .eq("id", currentUserId)
    .single();

  if (userError || !user) throw userError ?? new Error("User not found");

  const plan = getMockPlanFromRevenuecatId(user.revenuecat_app_user_id);
  const usage = user.recommendation_usage ?? {};

  const now = dayjs();
  const key =
    plan === "free" ? now.format("YYYY-MM") : now.format("YYYY-MM-DD");
  const count = Number(usage[key] ?? 0);

  const limits: Record<string, number> = {
    free: 10,
    standard: 5,
    premium: 10,
  };

  return count >= limits[plan];
}

function getMockPlanFromRevenuecatId(
  revenuecatUserId: string,
): "free" | "standard" | "premium" {
  if (!revenuecatUserId) return "free";
  if (revenuecatUserId.startsWith("premium_")) return "premium";
  if (revenuecatUserId.startsWith("standard_")) return "standard";
  return "free";
}
