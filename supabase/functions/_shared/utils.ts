// Deep merge two objects, preserving types
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as T & U;
  (Object.keys(source) as (keyof U)[]).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = (target as any)[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue as any;
    }
  });
  return output;
} 
