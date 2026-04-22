import { ISubscription } from '@/types/subscription';
import { SubscriptionRow } from '../interfaces/Subscription.interface';

export const mapSubscription = (row: SubscriptionRow): ISubscription => {
  return {
    id: row.subscription_id,
    plan_id: row.subscription_plan_id,
    organization_id: row.subscription_organization_id,

    start_date: row.start_date,
    end_date: row.end_date,

    status: Boolean(row.status),

    created_at: row.subscription_created_at,
    updated_at: row.subscription_updated_at,

    plan: {
      id: row.plan_id,
      name: row.plan_name,
      price: row.plan_price,
    },

    organization: {
      id: row.org_id,
      name: row.org_name,
      slug: row.org_slug,
      logo: row.org_logo,
    },
  };
};
