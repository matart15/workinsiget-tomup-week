import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.206.0/testing/asserts.ts";
import { assertSnapshot } from "https://deno.land/std@0.206.0/testing/snapshot.ts";

import { mockSupabaseAdmin } from "../_shared/mockSupabaseAdmin.ts";
import { getOtherUserId } from "./getOtherUserId.ts";

Deno.test("getOtherUserId should return other user id", async (t) => {
  const recommendation_id = 123;
  const { supabaseAdmin, allCalls } = mockSupabaseAdmin([
    {
      single: {
        data: { user2_id: "456" },
      },
    },
  ]);

  // Act
  const result = await getOtherUserId({
    recommendation_id,
    supabaseAdmin,
  });

  // Assert
  assertEquals(result, "456");
  // assert all args
  await assertSnapshot(t, allCalls);
});

Deno.test(
  "getOtherUserId should throw an error if recommendation does not exist",
  async () => {
    const recommendation_id = 123;
    const { supabaseAdmin } = mockSupabaseAdmin([
      {
        single: {
          error: new Error("Recommendation not found"),
        },
      },
    ]);

    // Act and Assert
    await assertRejects(
      async () => {
        await getOtherUserId({
          recommendation_id,
          supabaseAdmin,
        });
      },
      Error,
      "Recommendation not found",
    );
  },
);
