import { OrganizationAssetRow } from '../interfaces/OrganizationAsset.interface';

export const mapOrganizationAsset = (row: OrganizationAssetRow) => {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    file_path: row.file_path,

    created_at: row.created_at,
    updated_at: row.updated_at,

    organization: row.org_id
      ? {
          id: row.org_id,
          name: row.org_name,
        }
      : null,
  };
};
