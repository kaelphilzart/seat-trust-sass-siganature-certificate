import { IRepresentative } from '@/types/representative';
import { RepresentativeRow } from '../interfaces/Representative.interface';

export const mapRepresentative = (row: RepresentativeRow): IRepresentative => {
  return {
    id: row.id,
    name: row.name,
    title: row.title, // 🔥 FIX

    created_at: row.created_at,
    updated_at: row.updated_at,

    organization: row.org_id
      ? {
          id: row.org_id,
          name: row.org_name,
          slug: row.org_slug ?? '',
          logo: row.org_logo ?? '',
        }
      : null,
  };
};
