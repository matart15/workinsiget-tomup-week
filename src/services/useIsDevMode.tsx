import { useAllSearchParams } from '@/hooks/useAllSearchParams';

export const useIsDevMode = ({
  devString,
}: {
  devString: 'true';
}) => {
  const role = 'dev';
  const searchParams = useAllSearchParams();
  return role === 'dev' && searchParams.params.devMode === devString;
};
