// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { dataResponse } from '../_shared/dataResponse.ts';
import { CustomError } from '../_shared/errorResponse.ts';
import { pathSelector } from './pathSelector.ts';

Deno.serve(async (req) => {
  console.log('req:', req);
  if (req.method === 'OPTIONS') {
    return dataResponse({
      status: 'ok',
    });
  }
  try {
    const { path, ...args } = await req.json();

    const handlerFunction = pathSelector(path);
    if (!handlerFunction) {
      throw new CustomError('VALIDATION_ERROR', {
        extra: { path },
      }).errorResponse();
    }
    const data = await handlerFunction({
      req,
      args,
    });
    console.log('🚀 ~ big-function reeturn data:', data);

    return dataResponse(data);
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return error.errorResponse();
    }
    return new CustomError('UNHANDLED', {
      extra: error,
    }).errorResponse();
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/big-function' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"path":"userDelete"}'

*/
