import { OrganizationUserRow } from '../interfaces/OrganizationUser.interface';

export const mapOrganizationUser = (row: OrganizationUserRow) => {
  return {
    id: row.organization_user_id,
    role: row.role,

    user: row.user_id
      ? {
          id: row.user_id,
          email: row.email,
          is_active: Boolean(row.is_active),
          created_at: row.user_created_at,
          updated_at: row.user_updated_at,
        }
      : null,

    organization: row.organization_id
      ? {
          id: row.organization_id,
          name: row.organization_name,
          slug: row.organization_slug,
          logo: row.organization_logo ?? null,
          created_at: row.org_created_at,
          updated_at: row.org_updated_at,
        }
      : null,

    created_at: row.ou_created_at,
    updated_at: row.ou_updated_at,
  };
};
