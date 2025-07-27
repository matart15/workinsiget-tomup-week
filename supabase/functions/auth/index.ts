// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("asdfasdf11111111");
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

console.log("asdfasdf22222222");
import { dataResponse } from "../_shared/dataResponse.ts";
import { CustomError } from "../_shared/errorResponse.ts";
import { assertNever } from "../_shared/assertNever.ts";
import { userRegister } from "./userRegister/index.ts";
import { userDelete } from "./userDelete/index.ts";

const FUNCTION_NAME = "userRegister";
console.log(`Hello from ${FUNCTION_NAME}!`);
const pathSchema = z.object({
  path: z.union([z.literal("userRegister"), z.literal("userDelete")]),
});
const pathSelector = (path: z.infer<typeof pathSchema>["path"]) => {
  switch (path) {
    case "userRegister":
      return userRegister;
    case "userDelete":
      return userDelete;
    default:
      return assertNever(path);
  }
};

Deno.serve(async (req) => {
  console.log("🚀 ~ req:", req);
  try {
    const { path, ...args } = await req.json();
    const parseResult = pathSchema.safeParse({
      path,
    });
    console.log("🚀 ~ parseResult:", parseResult);
    if (!parseResult.success) {
      throw new CustomError("VALIDATION_ERROR", {
        extra: parseResult.error,
      }).errorResponse();
    }
    const handlerFunction = pathSelector(parseResult.data.path);
    if (!handlerFunction) {
      throw new CustomError("VALIDATION_ERROR", {
        extra: { path },
      }).errorResponse();
    }
    const data = await handlerFunction({
      req,
      args,
    });

    return dataResponse(data);
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return error.errorResponse();
    }
    return new CustomError("UNHANDLED", {
      extra: error,
    }).errorResponse();
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/userRegister' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
