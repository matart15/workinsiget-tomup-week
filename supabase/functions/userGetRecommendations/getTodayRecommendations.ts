import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../_shared/database.ts";
import { AppVersionString } from "../_shared/getAppVersion.ts";
import {
  MAX_MATCH_COUNT,
  recommendationSelectString_Old,
  recommendationSelectString_v2,
} from "./index.ts";

dayjs.extend(isSameOrAfter);

export const getTodayRecommendations = async ({
  supabaseAdmin,
  currentUserId,
  appVersion,
}: {
  supabaseAdmin: SupabaseClient<Database>;
  currentUserId: string;
  appVersion: AppVersionString;
}) => {
  const recommendationSelectString =
    appVersion === "1.0.3" || appVersion === "1.0.4" || appVersion === "1.0.5"
      ? recommendationSelectString_v2
      : recommendationSelectString_Old;
  const { data: recommendations, error: recommendationsError } =
    await supabaseAdmin
      .from("u_recommendations")
      .select(recommendationSelectString)
      .eq("user1_id", currentUserId)
      .is("status", null)
      .limit(MAX_MATCH_COUNT);
  if (recommendationsError) {
    throw recommendationsError;
  }
  return recommendations;
};
