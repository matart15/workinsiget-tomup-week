import { useQuery } from '@tanstack/react-query';

import { supabase } from '../supabase';

export const setupNewSubscription = async (accountId: string) => {
  return {};
};

export const manageSubscription = async (accountId: string) => {
  return {};
};

export const getBillingStatus = async (accountId: string) => {
  supabase.functions.invoke('billing-functions', {
    body: {
      action: 'get_billing_status',
      args: {
        account_id: accountId,
      },
    },
  });
};

export const useBillingStatus = (accountId: string) => {
  return useQuery({
    queryKey: ['billing-status', accountId],
    queryFn: () => getBillingStatus(accountId),
  });
};
