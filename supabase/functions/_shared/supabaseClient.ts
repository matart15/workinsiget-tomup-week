import {
  createClient,
  SupportedStorage,
} from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "./database.ts";

// Create a Supabase client with the Auth context of the logged in user.
const getSupabaseClient = (req: Request) => {
  console.log("qwerqwer", req.headers.get("Authorization"));
  const supabaseClient = createClient<Database>(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      auth: { storage: inMemoryStorageProvider() },
      global: req
        ? {
            headers: { Authorization: req.headers.get("Authorization")! },
          }
        : undefined,
    },
  );
  return supabaseClient;
};

function inMemoryStorageProvider(): SupportedStorage {
  const items = new Map();
  return {
    getItem: (key: string) => items.get(key),
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
  } as SupportedStorage;
}
export const getAuthUser = async (req: Request) => {
  const supabaseClient = _internals.getSupabaseClient(req);
  // Now we can get the session or user object
  const result = await supabaseClient.auth.getUser();
  console.log("🚀 ~ result:", result);
  const {
    data: { user },
  } = result;
  if (!user) throw new Error("No user found");
  return user;
};
export async function getAuthUserId(req: Request) {
  const currentUser = await _internals.getAuthUser(req);
  if (!currentUser) {
    throw new Error("No user id found");
  }
  return currentUser.id;
}

// for testing purpose
export const _internals = { getSupabaseClient, getAuthUser };
