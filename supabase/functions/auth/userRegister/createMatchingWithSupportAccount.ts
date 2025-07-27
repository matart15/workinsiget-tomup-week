import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../../_shared/database.ts";
import { CustomError } from "../../_shared/errorResponse.ts";

export const createMatchingWithSupportAccount = async ({
  currentUserId,
  supabaseAdmin,
}: {
  currentUserId: string;
  supabaseAdmin: SupabaseClient<Database>;
}) => {
  const { data, error } = await supabaseAdmin
    .from("m_app_settings")
    .select("*")
    .eq("name", "SUPPORT_USER_ID")
    .single();
  if (error) {
    throw new CustomError("CANT_GET_SUPPORT_USER_ID", {
      extra: error,
    });
  }
  console.log("🚀 ~ SUPPORT_USER_ID data:", data);
  const SUPPORT_USER_ID = data.value;
  const createMatchResult = await supabaseAdmin.from("u_matches").insert([
    {
      user1_id: currentUserId,
      user2_id: SUPPORT_USER_ID,
    },
  ]);
  if (createMatchResult.error) {
    throw new CustomError("CANT_CREATE_MATCH", {
      extra: createMatchResult.error,
    });
  }
  return createMatchResult.data;
};
