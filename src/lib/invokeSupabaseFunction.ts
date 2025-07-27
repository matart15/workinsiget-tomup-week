import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import type {
  FunctionPaths,
  OutputSchema,
  ValidationPaths,
} from '@/__generated__/validation';

import { sendErrorMessage } from './logger';
import { safeJsonParseString } from './safeParseJson';
import { supabase } from './supabase';

type BackendErrorResponse = {
  code: string;
  displayMessage?: string;
  extra?: unknown;
};

/**
 * use like this:
  const result = await invokeSupabaseFunction(
    SUPABASE_FUNCTION_NAMES.user.stripe,
    {
      body: {
        path: "subscribe",
        priceId: stripePriceId,
      },
    },
  );
  const { error } = result;
  if (error) {
    sendErrorMessage("error:", error);
    Alert.alert(`エラー`, error.displayMessage);
  }
 */
export const invokeSupabaseFunction = async<
  T extends ValidationPaths,
  P extends FunctionPaths<T>,
> (
  functionName: string,
  options: {
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {},
): Promise<{ data?: unknown; error: BackendErrorResponse | undefined }> => {
  try {
    const { data, error } = await supabase.functions.invoke<OutputSchema<T, P>>(functionName, options);

    if (error instanceof FunctionsHttpError) {
      const backendError = (await error.context.json()) as BackendErrorResponse;
      return { data: null, error: backendError };
    }
    if (error instanceof FunctionsRelayError) {
      sendErrorMessage('Relay error:', error.message);
      return {
        data: null,
        error: { code: 'RELAY_ERROR', displayMessage: error.message },
      };
    }
    if (error instanceof FunctionsFetchError) {
      sendErrorMessage('Fetch error:', error.message);
      return {
        data: null,
        error: { code: 'FETCH_ERROR', displayMessage: error.message },
      };
    }

    // parse data first
    const parsedData
      = typeof data === 'string' ? safeJsonParseString(data) : data;
    if (!parsedData) {
      sendErrorMessage('Failed to parse data:', data);
      return {
        data: null,
        error: {
          code: 'INVALID_JSON',
          displayMessage: 'サーバーエラーが発生しました。',
        },
      };
    }
    // const backendError = parsedData.error;
    if (typeof parsedData === 'object' && 'error' in parsedData) {
      return {
        data: null,
        error: parsedData.error as BackendErrorResponse,
      };
    }

    return { data, error: undefined };
  } catch (error) {
    sendErrorMessage('Unexpected error:', error);
    return {
      data: null,
      error: {
        code: 'UNKNOWN',
        displayMessage: 'An unexpected error occurred.',
      },
    };
  }
};
