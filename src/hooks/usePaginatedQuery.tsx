import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';

import { usePaginationRouter } from '@/hooks/usePaginationRouter';
import { paginationToDbRange } from '@/lib/paginationToDbRange';

type UsePaginatedQueryProps<T, K> = {
  initialPage?: number;
  size?: number;
  queryFn: (args: { from: number; to: number }) => T | Promise<T>;
  queryKey: (args: { from: number; to: number }) => K;
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

  const queryKey = [...queryKeyProp({ from, to }), page, size];
  const queryResult = useSuspenseQuery({
    queryFn: () => queryFn({ from, to }),
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
