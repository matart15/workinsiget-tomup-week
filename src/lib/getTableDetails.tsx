// @ts-expect-error because of code generation uses withDevMenu
import { invokeDevFunction } from '@/lib/invokeDevFunction';

export const getTableDetails = async (tableName?: string) => {
  if (!tableName) {
    return [];
  }

  const { data, error } = await invokeDevFunction({
    body: {
      args: {
        tableName,
      },
      path: 'getTableDetails',
    },
  });

  return data;
};
