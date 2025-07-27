import { assertEquals } from "https://deno.land/std@0.206.0/testing/asserts.ts";
import { assertSnapshot } from "https://deno.land/std@0.206.0/testing/snapshot.ts";

import { mockSupabaseAdmin } from "../_shared/mockSupabaseAdmin.ts";
import { getOtherUserRecommendation } from "./getOtherUserRecommendation.ts";

Deno.test(
  "getOtherUserRecommendation should return recommendation",
  async (t) => {
    const { supabaseAdmin, allCalls } = mockSupabaseAdmin([
      {
        limit: {
          data: [{ id: 123 }],
        },
      },
    ]);
    // Act
    const result = await getOtherUserRecommendation({
      supabaseAdmin,
      otherUserId: "456",
      currentUserId: "789",
    });
    // Assert
    assertEquals(result.data, [{ id: 123 }] as any);
    // assert all args
    await assertSnapshot(t, allCalls);
  },
);
Deno.test(
  "getOtherUserRecommendation should throw an error if data length is more than 1",
  async (t) => {
    const { supabaseAdmin, allCalls } = mockSupabaseAdmin([
      {
        limit: {
          data: [{ id: "123" }, { id: "456" }],
        },
      },
    ]);

    try {
      // Act
      await getOtherUserRecommendation({
        supabaseAdmin,
        otherUserId: "456",
        currentUserId: "789",
      });
      // Assert
      throw new Error("This should not happen 1");
    } catch (error) {
      // Assert
      assertEquals(
        error.message,
        "otherUserRecommendation.data.length is more than 1, this should not happen",
      );
      // assert args
      await assertSnapshot(t, allCalls);
    }
  },
);
Deno.test(
  "getOtherUserRecommendation should throw an error if there is an error",
  async (t) => {
    const { supabaseAdmin, allCalls } = mockSupabaseAdmin([
      {
        limit: {
          error: new Error("Some error"),
        },
      },
    ]);

    try {
      // Act
      await getOtherUserRecommendation({
        supabaseAdmin,
        otherUserId: "456",
        currentUserId: "789",
      });
      // Assert
      throw new Error("This should not happen 2");
    } catch (error) {
      // Assert
      assertEquals(error.message, "Some error");
      // assert args
      await assertSnapshot(t, allCalls);
    }
  },
);
