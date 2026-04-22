import { mutate } from 'swr';
import { SWR_KEYS } from './swrKeys';

export const refreshOrganizations = () => {
  return mutate(SWR_KEYS.organizations());
};

export const refreshOrganizationDetail = (id: string) => {
  return mutate(SWR_KEYS.organizationDetail(id));
};

export const refreshSubscriptions = () => {
  return mutate(SWR_KEYS.subscriptions());
};

export const refreshSubscriptionDetail = (id: string) => {
  return mutate(SWR_KEYS.subscriptionDetail(id));
};
