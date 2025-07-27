import type z from 'zod';

import { sendErrorMessage } from './logger';

/**
 * Utility function to sanitize fetched data based on the schema.
 * It strips out any fields that are not part of the schema.
 */
export const stripUnknownKeys = <T extends z.ZodRawShape>({
  schema,
  data = {},
}: {
  schema: z.ZodObject<T>;
  data?: Record<string, unknown> | null;
}) => {
  try {
    // Parse and return the sanitized data (remove unknown fields)
    const parsedData = schema.safeParse(data);

    if (!parsedData.success) {
      sendErrorMessage('stripUnknownKeys ~ parseError:', parsedData);
      return {};
    }
    return parsedData.data;
  } catch (_error) {
    return null;
  }
};
