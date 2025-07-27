import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../../_shared/database.ts";
import { AppVersionString } from "../../_shared/getAppVersion.ts";
import {
  recommendationSelectString_Old,
  recommendationSelectString_v2,
} from "../index.ts";
import { deleteForgottenRecommendations } from "./deleteForgottenRecommendations.ts";
import { getRandomIdsWithExclusion } from "./getRandomIdsWithExclusion.ts";
import { getRecommendationExcludeUserIds } from "./getRecommendationExcludeUserIds.ts";

dayjs.extend(isSameOrAfter);

export const createFiveRecommendation = async ({
  currentUserId,
  supabaseAdmin,
  appVersion,
}: {
  currentUserId: string;
  supabaseAdmin: SupabaseClient<Database>;
  appVersion: AppVersionString;
}) => {
  const recommendationSelectString =
    appVersion === "1.0.3" || appVersion === "1.0.4" || appVersion === "1.0.5"
      ? recommendationSelectString_v2
      : recommendationSelectString_Old;
  // match table have user1_id and user2_id, user1_id and user2_id are matched if user1_id and user2_id ids are in match table, select 5 profiles that are not matched with current user
  // const { data: recommendedUsers, error: recommendedUsersError } =
  //   await supabaseAdmin.rpc(RPC_NAME, {
  //     current_user_id: currentUserId,
  //     recommend_count: MAX_MATCH_COUNT,
  //   });
  // if (recommendedUsersError) {
  //   throw recommendedUsersError;
  // }

  // 1. delete all old rejected and forgotten recommendations
  // we don't want to fail the function because of delete
  await deleteForgottenRecommendations({ supabaseAdmin });

  // 2. get all user ids that needs to be excluded from today's recommendations
  const excludeUserIds = await getRecommendationExcludeUserIds({
    currentUserId,
    supabaseAdmin,
  });

  // 3. get 5 random user ids that are not in excludeUserIds
  const randomRecommendingUserIds = await getRandomIdsWithExclusion({
    idsToExclude: excludeUserIds,
    supabaseAdmin,
  });

  // 4. insert 5 recommendations for current user
  const { data: recommendations, error: recommendationsError } =
    await supabaseAdmin
      .from("u_recommendations")
      .insert(
        randomRecommendingUserIds.map((randomRecommendingUserId: string) => ({
          user1_id: currentUserId,
          user2_id: randomRecommendingUserId,
          // status  will be NULL. that means user is not done any action yet
          last_action_at: dayjs().format("YYYY-MM-DD"),
        })),
      )
      .select(recommendationSelectString);
  if (recommendationsError) {
    throw recommendationsError;
  }

  // 5. update user's last_recommended_date to today
  const { error: updateUserDataError } = await supabaseAdmin
    .from("users")
    .update({ last_recommended_date: dayjs().format("YYYY-MM-DD") })
    .eq("id", currentUserId)
    .order("id", { ascending: false })
    .limit(1);
  if (updateUserDataError) {
    throw updateUserDataError;
  }
  return recommendations;
};
