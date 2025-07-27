import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { paginationToDbRange } from '@/lib/paginationToDbRange';
import { usePaginationRouter } from '@/lib/usePaginationRouter';

type UsePaginatedQueryProps<T, K> = {
  initialPage?: number;
  size?: number;
  queryFn: (args: { from: number; to: number }) => T | Promise<T>;
  queryKey: K;
};

export const usePaginatedQuery = <
  T extends { count: number | null },
  K extends QueryKey,
>({
  queryFn,
  queryKey: queryKeyProp,
}: UsePaginatedQueryProps<T, K>) => {
  const { page, size } = usePaginationRouter();
  const { from, to } = paginationToDbRange({
    page,
    size,
  });

  const queryKey = [...queryKeyProp, page, size];
  const queryResult = useQuery({
    queryFn: args => queryFn({ from, to, ...args }),
    queryKey,
  });
  const total = queryResult.data?.count ?? 0;
  return {
    pagination: {
      count: total,
      hasNext: total > page * size,
      hasPrevious: page > 1,
      page,
      size,
    },
    queryKey,
    queryResult,
  };
};
