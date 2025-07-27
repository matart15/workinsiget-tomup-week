import { useAuth } from '@matart15/lib_authentication_supabase';

export const useGetRole = () => {
  const { user } = useAuth();
  const role = user?.app_metadata?.role;
  return role;
};
