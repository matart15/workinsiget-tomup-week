import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../../_shared/database.ts";

dayjs.extend(isSameOrAfter);
const DAYS_TO_RESET_FORGOTTEN_RECOMMENDATIONS = 15;
export const deleteForgottenRecommendations = async ({
  supabaseAdmin,
}: {
  supabaseAdmin: SupabaseClient<Database>;
}) => {
  // old recommendations that are not accepted
  const {
    data: deleteForgottenRecommendations,
    error: deletedForgottenRecommendationsError,
  } = await supabaseAdmin
    .from("u_recommendations")
    .delete()
    // .neq("status", "ACCEPTED")
    .lt(
      "last_action_at",
      dayjs()
        .subtract(DAYS_TO_RESET_FORGOTTEN_RECOMMENDATIONS, "day")
        .format("YYYY-MM-DD"),
    )
    .select("id, user1_id, user2_id");
  if (deletedForgottenRecommendationsError) {
    throw deletedForgottenRecommendationsError;
  }
};
