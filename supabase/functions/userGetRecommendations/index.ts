import dayjs from "https://cdn.skypack.dev/dayjs";
import isSameOrAfter from "https://cdn.skypack.dev/dayjs/plugin/isSameOrAfter";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { Database } from "../_shared/database.ts";
import { dataResponse } from "../_shared/dataResponse.ts";
import { CustomError } from "../_shared/errorResponse.ts";
import { getAppVersion } from "../_shared/getAppVersion.ts";
import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../_shared/supabaseClient.ts";
import { createFiveRecommendation } from "./createFiveRecommendation/index.ts";
import { getIsRecommendationCountReached } from "./getIsRecommendationCountReached.ts";
import { getIsRecommendedToday } from "./getIsRecommendedToday.ts";
import { getTodayRecommendations } from "./getTodayRecommendations.ts";
dayjs.extend(isSameOrAfter);

// const RPC_NAME = "get_recommended_profiles";
export const MAX_MATCH_COUNT = 5;
export const recommendationSelectString_Old = `
*,
recommendedUsers:users!user2_id(
  *,
  u_jobs(
    *
  )
)
` as const;
export const recommendationSelectString_v2 = `
*,
recommendedUsers:users!user2_id(*)
` as const;

serve(async (req) => {
  console.log("🚀 ~ req:", req);
  try {
    const appVersion = await getAppVersion(req);
    // 1. get current user id
    const supabaseAdmin = getSupabaseAdmin();
    const currentUserId = await getAuthUserId(req);
    console.log("1111111111111111 ~ currentUserId:", currentUserId);

    let profilesToRecommend: Database["public"]["Tables"]["u_recommendations"]["Row"][] =
      [];
    // 2. check if user has already saw recommendations today
    const isRecommendedToday = await getIsRecommendedToday({
      supabaseAdmin,
      currentUserId,
    });
    // const isRecommendationCountReached = await getIsRecommendationCountReached({
    //   supabaseAdmin,
    //   currentUserId,
    // });
    console.log("22222222 ~ isRecommendedToday:", isRecommendedToday);
    if (!isRecommendedToday) {
      // 3. if not, create 5 recommendations for user
      const getFiveProfile = await createFiveRecommendation({
        currentUserId,
        supabaseAdmin,
        appVersion,
      });
      profilesToRecommend = getFiveProfile;
      // console.log("33333333 ~ profilesToRecommend:", profilesToRecommend);
    } else {
      // 4. if yes, get today's recommendations for user
      profilesToRecommend = await getTodayRecommendations({
        currentUserId,
        supabaseAdmin,
        appVersion,
      });
      // console.log("44444", profilesToRecommend);
    }

    console.log("🚀 ~ profilesToRecommend:", profilesToRecommend);
    return dataResponse(profilesToRecommend);
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return error.errorResponse();
    }
    return new CustomError("UNHANDLED", {
      extra: error,
    }).errorResponse();
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
