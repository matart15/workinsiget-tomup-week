const SUPABASE_FUNCTION_NAMES = [
  "from",
  "select",
  "eq",
  "delete",
  "update",
  "insert",
  "limit",
  "single",
] as const;
type ReturnFunctionName = (typeof SUPABASE_FUNCTION_NAMES)[number];

export const mockSupabaseAdmin: any = (
  returnValues: Record<ReturnFunctionName, any>[],
) => {
  let allCalls: any = [];
  let allArgs: any = [];
  let currentChainIndex = 0;

  const supabaseAdmin: any = {};
  for (const functionName of SUPABASE_FUNCTION_NAMES) {
    supabaseAdmin[functionName] = (...args: any[]) => {
      const returnValue = returnValues[currentChainIndex];
      const returnFunctionName: ReturnFunctionName = Object.keys(
        returnValue,
      )[0] as any;

      allArgs.push({ [functionName]: args });
      if (returnFunctionName === functionName) {
        allCalls.push(allArgs);
        currentChainIndex++;
        return returnValue[returnFunctionName];
      }
      return supabaseAdmin;
    };
  }

  return {
    allCalls,
    supabaseAdmin,
  };
};
