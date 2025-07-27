import { assertRejects } from "https://deno.land/std@0.206.0/testing/asserts.ts";
import { assertSnapshot } from "https://deno.land/std@0.206.0/testing/snapshot.ts";

import { mockSupabaseAdmin } from "../_shared/mockSupabaseAdmin.ts";
import { createNewMatchFromTwoRecommendation } from "./createNewMatchFromTwoRecommendation.ts";

Deno.test(
  "createNewMatchFromTwoRecommendation should create a new match and delete the recommendations",
  async (t) => {
    const recommendation_id = 123;
    const otherUserRecommendationId = 456;
    const currentUserId = "789";
    const otherUserId = "012";
    const { supabaseAdmin, allCalls } = mockSupabaseAdmin([
      {
        insert: {
          data: {},
        },
      },
      {
        eq: {
          data: {},
        },
      },
      {
        eq: {
          data: {},
        },
      },
    ]);

    // Act
    await createNewMatchFromTwoRecommendation({
      recommendation_id,
      supabaseAdmin,
      otherUserId,
      currentUserId,
      otherUserRecommendationId,
    });

    // Assert
    await assertSnapshot(t, allCalls);
  },
);

Deno.test(
  "createNewMatchFromTwoRecommendation should throw an error if match insertion fails",
  async () => {
    const recommendation_id = 123;
    const otherUserRecommendationId = 456;
    const currentUserId = "789";
    const otherUserId = "012";
    const { supabaseAdmin } = mockSupabaseAdmin([
      {
        insert: {
          error: new Error("Match insertion failed"),
        },
      },
    ]);

    // Act and Assert
    await assertRejects(
      async () => {
        await createNewMatchFromTwoRecommendation({
          recommendation_id,
          supabaseAdmin,
          otherUserId,
          currentUserId,
          otherUserRecommendationId,
        });
      },
      Error,
      "Match insertion failed",
    );
  },
);

Deno.test(
  "createNewMatchFromTwoRecommendation should throw an error if recommendation deletion fails",
  async () => {
    const recommendation_id = 123;
    const otherUserRecommendationId = 456;
    const currentUserId = "789";
    const otherUserId = "012";
    const { supabaseAdmin } = mockSupabaseAdmin([
      {
        insert: {
          data: {},
        },
      },
      {
        eq: {
          error: new Error("Recommendation deletion failed"),
        },
      },
    ]);

    // Act and Assert
    await assertRejects(
      async () => {
        await createNewMatchFromTwoRecommendation({
          recommendation_id,
          supabaseAdmin,
          otherUserId,
          currentUserId,
          otherUserRecommendationId,
        });
      },
      Error,
      "Recommendation deletion failed",
    );
  },
);

Deno.test(
  "createNewMatchFromTwoRecommendation should throw an error if other user recommendation deletion fails",
  async () => {
    const recommendation_id = 123;
    const otherUserRecommendationId = 456;
    const currentUserId = "789";
    const otherUserId = "012";
    const { supabaseAdmin } = mockSupabaseAdmin([
      {
        insert: {
          data: {},
        },
      },
      {
        eq: {
          data: {},
        },
      },
      {
        eq: {
          error: new Error("Other user recommendation deletion failed"),
        },
      },
    ]);

    // Act and Assert
    await assertRejects(
      async () => {
        await createNewMatchFromTwoRecommendation({
          recommendation_id,
          supabaseAdmin,
          otherUserId,
          currentUserId,
          otherUserRecommendationId,
        });
      },
      Error,
      "Other user recommendation deletion failed",
    );
  },
);
