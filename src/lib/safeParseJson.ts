export const safeJsonParseString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  try {
    const jsonValue: unknown = JSON.parse(value);

    return jsonValue;
  } catch {
    return undefined;
  }
};
