import { OrganizationRow } from '../interfaces/Organization.interface';

export const mapOrganization = (row: OrganizationRow) => {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,

    created_at: row.created_at,
    updated_at: row.updated_at,

    subscription: row.subscription_id
      ? {
          id: row.subscription_id,

          organization: {
            id: row.id,
            name: row.name,
            slug: row.slug,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },

          plan: row.plan_id
            ? {
                id: row.plan_id,
                name: row.plan_name,
                price: row.plan_price,
              }
            : null,

          plan_id: row.plan_id,
          start_date: row.start_date,
          end_date: row.end_date,
          status: !!row.status,

          created_at: row.sub_created_at,
          updated_at: row.sub_updated_at,
        }
      : null,
  };
};
