import { useQuery } from '@tanstack/react-query';

import { getTableDetails } from '@/lib/getTableDetails';
import { invokeDevFunction } from '@/lib/invokeDevFunction';

export const usePublicTables = () => {
  return useQuery({
    queryKey: ['public_tables'],
    queryFn: async () => {
      // const { data, error } = await supabase.rpc('list_public_tables');

      const { data, error } = await invokeDevFunction({
        body: {
          args: {},
          path: 'listPublicTables',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};

export const useTableColumns = (tableName?: string) => {
  return useQuery({
    queryKey: ['table_columns', tableName],
    queryFn: async () => {
      if (!tableName) {
        return [];
      }
      return await getTableDetails(tableName);
    },
    enabled: !!tableName,
  });
};
