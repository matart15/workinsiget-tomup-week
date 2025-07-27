import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "./database.ts";

export const getSupabaseAdmin = () => {
  const supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      },
    },
  );
  return supabaseClient;
};
