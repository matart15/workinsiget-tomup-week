import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getAuthUser } from "../../_shared/supabaseClient.ts";
import { getSupabaseAdmin } from "../../_shared/supabaseAdmin.ts";
import { CustomError } from "../../_shared/errorResponse.ts";
import { validateArgs, validationSchema, type BigFunctionPaths, type ValidationSchema } from "../../_shared/validation.ts";

const FUNCTION_NAME = "adminListUsersByRole" as const satisfies BigFunctionPaths;

const GROUP_NAME = "big-function" as const satisfies keyof ValidationSchema;

const inputSchema =
validationSchema(z)[GROUP_NAME][FUNCTION_NAME].inputSchema;
const outputSchema =
validationSchema(z)[GROUP_NAME][FUNCTION_NAME].outputSchema;

export const adminListUsersByRole = async ({ req, args }: { req: Request; args: unknown }) => {
  console.log("🚀 ~ adminListUsersByRole ~ FUNCTION CALLED WITH ARGS:", args);
  console.log(`${FUNCTION_NAME} called`, args);
  const currentUser = await getAuthUser(req);
  if (currentUser.app_metadata?.role !== "admin") {
    throw new CustomError("UNAUTHORIZED", { extra: "Not admin" });
  }
  const validatedArgs = validateArgs({ args, schema: inputSchema });

  console.log("🚀 ~ adminListUsersByRole ~ validatedArgs:", validatedArgs)
  const { role, from, to } = validatedArgs;
  console.log("🚀 ~ adminListUsersByRole ~ role:", role)
  console.log("🚀 ~ adminListUsersByRole ~ pagination params:", { from, to })
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    throw new CustomError("UNAUTHORIZED", { extra: error });
  }

  // Fetch public.users rows for these IDs
  const { data: publicUsers, error: publicUsersError } = await supabaseAdmin
    .from("users")
    .select("*")

  if (publicUsersError) {
    throw new CustomError("UNAUTHORIZED", { extra: publicUsersError });
  }

  // Map public.users by id for quick lookup
  const publicUsersMap = Object.fromEntries(
    (publicUsers ?? []).map(u => [u.id, u])
  );

  // Filter users by app_metadata.role and attach public.users row
  const filtered = data.users
    .filter(
      (u) => ((role === "user" && !u.app_metadata?.role) || u.app_metadata?.role === role)
    )
    .map(u => ({
      ...u,
      profile: publicUsersMap[u.id] ?? null
    }));

  console.log("🚀 ~ adminListUsersByRole ~ filtered count:", filtered.length)

  // Apply pagination if from/to are provided
  const totalCount = filtered.length;
  let paginatedUsers = filtered;
  
  if (from !== undefined && to !== undefined && from >= 0 && to >= 0) {
    console.log("🚀 ~ adminListUsersByRole ~ applying pagination:", { from, to })
    paginatedUsers = filtered.slice(from, to + 1);
    console.log("🚀 ~ adminListUsersByRole ~ paginated count:", paginatedUsers.length)
  } else {
    console.log("🚀 ~ adminListUsersByRole ~ no pagination applied, params:", { from, to })
  }

  const parsedOutput = outputSchema.safeParse({
    users: paginatedUsers,
    count: totalCount,
  });
  if (!parsedOutput.success) {
    throw new CustomError("THIS_SHOULD_NOT_HAPPEN", {
      extra: parsedOutput.error,
    });
  }

  return parsedOutput.data;
};
