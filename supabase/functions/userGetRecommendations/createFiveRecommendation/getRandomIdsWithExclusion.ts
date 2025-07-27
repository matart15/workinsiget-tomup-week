import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import { Database } from "../../_shared/database.ts";
import { MAX_MATCH_COUNT } from "../index.ts";

export const getRandomIdsWithExclusion = async ({
  supabaseAdmin,
  idsToExclude,
}: {
  supabaseAdmin: SupabaseClient<Database>;
  idsToExclude: string[];
}) => {
  const { data: randomIds, error: randomIdsError } = await supabaseAdmin
    .from("users")
    .select("id")
    .not("id", "in", `(${idsToExclude.join(",")})`)
    .not("firstname", "is", null)
    .limit(MAX_MATCH_COUNT);

  if (randomIdsError) {
    throw randomIdsError;
  }
  return randomIds.map((randomId) => randomId.id);
};
