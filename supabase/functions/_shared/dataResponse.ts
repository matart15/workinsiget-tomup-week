import { corsResponse } from "./cors.ts";

export const dataResponse = (data: any) => {
  return corsResponse(
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }),
  );
};
