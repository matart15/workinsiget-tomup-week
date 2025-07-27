// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { dataResponse } from "../_shared/dataResponse.ts";
import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getAuthUserId } from "../_shared/supabaseClient.ts";
import { createNewMatchFromTwoRecommendation } from "./createNewMatchFromTwoRecommendation.ts";
import { getOtherUserId } from "./getOtherUserId.ts";
import { getOtherUserRecommendation } from "./getOtherUserRecommendation.ts";
import { CustomError } from "../_shared/errorResponse.ts";

export const _internals = {
  getAuthUserId,
  getOtherUserId,
  getSupabaseAdmin,
  getOtherUserRecommendation,
  createNewMatchFromTwoRecommendation,
};

const validateArgs = ({ args }: { args: any }) => {
  const { recommendation_id } = args;
  if (!recommendation_id) throw new Error("No recommendation_id found");
  if (typeof recommendation_id !== "number")
    throw new Error("recommendation_id is not number");

  return {
    recommendation_id,
  };
};

// export for test
export const handler: (request: Request) => Promise<Response> = async (req) => {
  try {
    // 1. get current user id and validate args
    const currentUserId = await _internals.getAuthUserId(req);
    const args = await req.json();
    const supabaseAdmin = _internals.getSupabaseAdmin();
    const { recommendation_id } = validateArgs({
      args,
    });
    // 2. get other user id from recommendation_id
    const otherUserId = await _internals.getOtherUserId({
      recommendation_id,
      supabaseAdmin,
      currentUserId,
    });
    // 3. find if there is ACCEPTED recommendation from other user to current user
    const otherUserAcceptedRecommendation =
      await _internals.getOtherUserRecommendation({
        supabaseAdmin,
        otherUserId,
        currentUserId,
      });

    if (otherUserAcceptedRecommendation.data.length === 1) {
      // 4. if other user have accepted recommendation for current user create match between 2 users
      await _internals.createNewMatchFromTwoRecommendation({
        recommendation_id,
        supabaseAdmin,
        otherUserId,
        currentUserId,
        otherUserRecommendationId: otherUserAcceptedRecommendation.data[0].id,
      });
      return dataResponse({
        status: "ok1",
      });
    }

    // other user does not have accepted recommendation to current user , update recommendation status to ACCEPTED
    const { error: recommendationUpdateError } = await supabaseAdmin
      .from("u_recommendations")
      .update({ status: "ACCEPTED" })
      .eq("id", recommendation_id);

    if (recommendationUpdateError) {
      throw recommendationUpdateError;
    }

    return dataResponse({
      status: "ok2",
    });
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return error.errorResponse();
    }
    return new CustomError("UNHANDLED", {
      extra: error,
    }).errorResponse();
  }
};

serve(handler);

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
