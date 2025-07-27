import { stub } from "https://deno.land/std@0.206.0/testing/mock.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { _internals, handler } from "./index.ts";

Deno.test.only(
  "handler should create a match if other user has accepted recommendation",
  async (t) => {
    const currentUserId = "789";
    const recommendation_id = 123;
    const otherUserId = "456";
    const otherUserRecommendationId = 321;
    const args = { recommendation_id };

    const getAuthUserIdStub = stub(
      _internals,
      "getAuthUserId",
      async () => currentUserId,
    );
    const getOtherUserIdStub = stub(
      _internals,
      "getOtherUserId",
      async () => otherUserId,
    );
    const getSupabaseAdminStub = stub(
      _internals,
      "getSupabaseAdmin",
      () => ({}) as any, // we stubed other function. So this stub should not be called,
    );

    const getOtherUserRecommendationStub = stub(
      _internals,
      "getOtherUserRecommendation",
      () =>
        ({
          data: [
            {
              id: otherUserRecommendationId,
            },
          ],
        }) as any,
    );

    const createNewMatchFromTwoRecommendationStub = stub(
      _internals,
      "createNewMatchFromTwoRecommendation",
      () => ({ status: "ok2" }) as any,
    );

    const request = {
      json: async () => args,
    };

    try {
      const response = await handler(request as any);
      const responseJson = await response.json();

      // assertEquals(allArgs, {});
      assertEquals(responseJson, {
        status: "ok1",
      } as any);
    } finally {
      getAuthUserIdStub.restore();
      getOtherUserIdStub.restore();
      getSupabaseAdminStub.restore();
      getOtherUserRecommendationStub.restore();
      createNewMatchFromTwoRecommendationStub.restore();
    }
  },
);

// Deno.test(
//   "handler should update recommendation status if other user has not accepted recommendation",
//   async (t) => {
//     const recommendation_id = 123;
//     const currentUserId = "789";
//     const otherUserId = "456";
//     const args = { recommendation_id };
//     const supabaseAdmin = mockSupabaseAdmin([
//       {
//         single: {
//           data: { user2_id: otherUserId },
//         },
//       },
//       {
//         select: {
//           data: [],
//         },
//       },
//       {
//         update: {},
//       },
//     ]).supabaseAdmin;

//     const request = {
//       json: async () => args,
//     };

//     const response = await handler(request, currentUserId, supabaseAdmin);

//     assertEquals(response, { status: "ok2" });
//   },
// );

// Deno.test(
//   "handler should throw an error if recommendation does not exist",
//   async () => {
//     const recommendation_id = 123;
//     const currentUserId = "789";
//     const args = { recommendation_id };
//     const supabaseAdmin = mockSupabaseAdmin([
//       {
//         single: {
//           error: new Error("Recommendation not found"),
//         },
//       },
//     ]).supabaseAdmin;

//     const request = {
//       json: async () => args,
//     };

//     await assertRejects(
//       async () => {
//         await handler(request, currentUserId, supabaseAdmin);
//       },
//       Error,
//       "Recommendation not found",
//     );
//   },
// );
