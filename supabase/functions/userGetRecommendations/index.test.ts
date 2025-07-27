import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  afterAll,
  beforeAll,
  describe,
  it,
} from "https://deno.land/std@0.168.0/testing/bdd.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../_shared/database.ts";
import { getSupabaseTestAdmin } from "../_shared/supabaseTestAdmin.ts";
import { checkDbChange } from "../_shared/test_helper/checkDbChange.ts";
const FUNCTION_NAME = "userGetRecommendations";

interface TestData {
  tableName: keyof Database["public"]["Tables"] | "auth.users";
  id: string;
}

async function cleanupTestData(
  supabase: SupabaseClient<Database>,
  testData: TestData[],
) {
  for (const data of testData) {
    if (data.tableName === "auth.users") {
      await supabase.auth.admin.deleteUser(data.id);
    } else {
      await supabase.from(data.tableName).delete().eq("id", data.id);
    }
  }
}

async function deleteAllUsers(supabase: SupabaseClient<Database>) {
  checkDbChange();
  // Fetch all auth users
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }

  const failed = [];

  console.log(
    "🚀 ~ users:",
    data.users.map((user) => user.email),
  );
  for (const user of data.users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      failed.push({ id: user.id, error: deleteError.message });
    }
  }

  console.log(`✅ Deleted ${data.users.length - failed.length} users`);
  if (failed.length > 0) {
    console.warn(`⚠️ Failed to delete ${failed.length} users:`, failed);
  }
}

describe(FUNCTION_NAME, () => {
  const supabase = getSupabaseTestAdmin();
  const testUserEmail = `test_${FUNCTION_NAME}_1@test.com`;
  let testUserId = "";
  let accessToken = "";
  const functionUrl = `http://localhost:54321/functions/v1/${FUNCTION_NAME}`;
  const testData: TestData[] = [];

  // Setup: Create test data
  beforeAll(async () => {
    /*
     * Somehow it returns only users and cant delete user
     */
    // await deleteAllUsers(supabase);
    // Create test user and get access token
    const userCreateResult = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: "Ab12345",
      email_confirm: true,
    });

    if (userCreateResult.error) {
      console.log("🚀 ~ userCreateResult.error:", userCreateResult.error);
      throw new Error("Could not create test user");
    }
    testUserId = userCreateResult.data.user?.id;
    const publicUserInsertResult = await supabase.from("users").insert([
      {
        id: testUserId,
        email: testUserEmail,
      },
    ]);
    if (publicUserInsertResult.error) {
      console.log(
        "🚀 ~ publicUserInsertResult.error:",
        publicUserInsertResult.error,
      );
      throw new Error(`Could not create public user `);
    }
    testData.push({ tableName: "auth.users", id: testUserId });
    console.log("🚀 ~ testUserId:", testUserId);

    // Sign in to get access token
    const signInResult = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: "Ab12345",
    });
    if (signInResult.error) {
      console.log("🚀 ~ signInResult.error:", signInResult.error);
      throw new Error("Could not sign in test user");
    }
    accessToken = signInResult.data.session?.access_token;

    // Create test users to be recommended
    for (let i = 1; i <= 8; i++) {
      const recommendedUserResult = await supabase.auth.admin.createUser({
        email: `test_${FUNCTION_NAME}_recommended_${i}@test.com`,
        password: "Ab12345",
        email_confirm: true,
      });
      if (recommendedUserResult.error) {
        console.log(
          "🚀 ~ recommendedUserResult.error:",
          recommendedUserResult.error,
        );
        throw new Error(`Could not create recommended test user ${i}`);
      }
      const id = recommendedUserResult.data.user?.id;
      const publicUserInsertResult = await supabase.from("users").insert([
        {
          id,
          email: `test_${FUNCTION_NAME}_recommended_${i}@test.com`,
          invited_by: testUserEmail,
        },
      ]);
      if (publicUserInsertResult.error) {
        console.log(
          "🚀 ~ publicUserInsertResult.error:",
          publicUserInsertResult.error,
        );
        throw new Error(
          `Could not create public user for recommended test user ${i}`,
        );
      }
      testData.push({
        tableName: "auth.users",
        id,
      });
    }
  });

  afterAll(async () => {
    // Clean up all test data
    await cleanupTestData(supabase, testData);
  });
  it("should create new recommendations when user hasn't received any today", async () => {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "app-version": "1.0.0",
      },
    });
    const result = await response.json();
    // Verify response structure
    assertEquals(result.length, 5);
    assertEquals(typeof result[0].id, "number");
    assertEquals(result[0].user1_id, testUserId);
    // Verify user's last_recommended_date was updated
    const { data: userData } = await supabase
      .from("users")
      .select("last_recommended_date")
      .eq("id", testUserId)
      .single();
    assertEquals(
      userData?.last_recommended_date?.split("T")[0],
      new Date().toISOString().split("T")[0],
    );
    // Verify recommendations were saved in database
    const { data: savedRecommendations } = await supabase
      .from("u_recommendations")
      .select("*")
      .eq("user1_id", testUserId);
    assertEquals(savedRecommendations?.length, 5);
  });

  it("should return existing recommendations if user already received them today", async () => {
    // First request to create recommendations
    const firstResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "app-version": "1.0.0",
      },
    });

    const firstResult = await firstResponse.json();

    // Get the IDs of the first set of recommendations
    const firstRecommendationIds = firstResult.map((rec: any) => rec.id).sort();

    // Second request should return the same recommendations
    const secondResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "app-version": "1.0.0",
      },
    });

    const secondResult = await secondResponse.json();

    // Verify we got the same recommendations
    const secondRecommendationIds = secondResult
      .map((rec: any) => rec.id)
      .sort();

    assertEquals(secondRecommendationIds, firstRecommendationIds);
  });

  it("should handle authentication error", async () => {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid_token",
        "Content-Type": "application/json",
        "app-version": "1.0.0",
      },
    });

    const result = await response.json();
    assertEquals(result.error, {
      code: "UNHANDLED",
      displayMessage: "サーバーエラーが発生しました。",
      extra: {},
    });
  });
});
