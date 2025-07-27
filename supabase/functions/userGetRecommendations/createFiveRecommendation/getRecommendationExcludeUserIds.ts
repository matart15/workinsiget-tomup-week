import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../../_shared/database.ts";
import { CustomError } from "../../_shared/errorResponse.ts";

dayjs.extend(isSameOrAfter);

export const getRecommendationExcludeUserIds = async ({
  currentUserId,
  supabaseAdmin,
}: {
  currentUserId: string;
  supabaseAdmin: SupabaseClient<Database>;
}) => {
  const { data, error } = await supabaseAdmin
    .from("m_app_settings")
    .select("*")
    .eq("name", "SUPPORT_USER_ID")
    .single();
  if (error) {
    throw new CustomError("CANT_GET_SUPPORT_USER_ID", {
      extra: error,
    });
  }
  console.log("🚀 ~ SUPPORT_USER_ID data:", data);
  const SUPPORT_USER_ID = data.value;

  const [
    matchesFromMe,
    matchesToMe,
    recommendationFromMeIds,
    recommendationToMeIds,
  ] = await Promise.allSettled([
    // matches from me
    supabaseAdmin
      .from("u_matches")
      .select("user2_id")
      .eq("user1_id", currentUserId),
    // matches to me
    supabaseAdmin
      .from("u_matches")
      .select("user1_id")
      .eq("user2_id", currentUserId),
    // recommendations from me. I already saw them
    supabaseAdmin
      .from("u_recommendations")
      .select("user2_id")
      .eq("user1_id", currentUserId),
    // recommendations from other user. I did not see it yet, but if other user is rejected there is no need to see it
    supabaseAdmin
      .from("u_recommendations")
      .select("user1_id")
      .eq("user2_id", currentUserId)
      .eq("status", "REJECTED"),
  ]);
  if (matchesFromMe.status === "rejected") {
    throw matchesFromMe.reason;
  }
  if (matchesFromMe.value.error) {
    throw matchesFromMe.value.error;
  }
  if (matchesToMe.status === "rejected") {
    throw matchesToMe.reason;
  }
  if (matchesToMe.value.error) {
    throw matchesToMe.value.error;
  }
  if (recommendationFromMeIds.status === "rejected") {
    throw recommendationFromMeIds.reason;
  }
  if (recommendationFromMeIds.value.error) {
    throw recommendationFromMeIds.value.error;
  }
  if (recommendationToMeIds.status === "rejected") {
    throw recommendationToMeIds.reason;
  }
  if (recommendationToMeIds.value.error) {
    throw recommendationToMeIds.value.error;
  }

  const excludeUserIds = [
    currentUserId,
    SUPPORT_USER_ID,
    ...matchesFromMe.value.data.map((match) => match.user2_id),
    ...matchesToMe.value.data.map((match) => match.user1_id),
    ...recommendationFromMeIds.value.data.map(
      (recommendation) => recommendation.user2_id,
    ),
    ...recommendationToMeIds.value.data.map(
      (recommendation) => recommendation.user1_id,
    ),
  ];
  return excludeUserIds;
};
