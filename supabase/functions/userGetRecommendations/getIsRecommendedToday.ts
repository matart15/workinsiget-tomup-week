import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../_shared/database.ts";

dayjs.extend(isSameOrAfter);

export async function getIsRecommendedToday({
  supabaseAdmin,
  currentUserId,
}: {
  supabaseAdmin: SupabaseClient<Database>;
  currentUserId: string;
}) {
  const { data: userLastRecommendedDate, error: lastRecommendedDateError } =
    await supabaseAdmin
      .from("users")
      .select("last_recommended_date")
      .eq("id", currentUserId)
      .limit(1)
      .single();
  if (lastRecommendedDateError) {
    throw lastRecommendedDateError;
  }

  const isRecommendedToday =
    !!userLastRecommendedDate.last_recommended_date &&
    dayjs(userLastRecommendedDate.last_recommended_date).isSameOrAfter(
      dayjs(),
      "day",
    );
  return isRecommendedToday;
}
