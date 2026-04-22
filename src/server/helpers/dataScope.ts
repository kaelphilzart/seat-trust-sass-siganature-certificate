import { AuthUser } from './auth';

/**
 * Using 'unknown' instead of 'any' to satisfy ESLint
 * while maintaining flexibility for DB parameters.
 */
type QueryParam = string | number | boolean | Date | null | unknown;

export function applyOrganizationScope(
  user: AuthUser,
  baseQuery: string,
  params: QueryParam[] = [] // Fixed here
) {
  // SUPERADMIN → no filter
  if (!user.organization_id) {
    return {
      query: baseQuery,
      params,
    };
  }

  // USER → pakai filter
  return {
    query: `${baseQuery} WHERE organization_id = ?`,
    params: [...params, user.organization_id],
  };
}

export function applyScopeSafe(
  user: AuthUser,
  baseQuery: string,
  params: QueryParam[] = [] // Fixed here
) {
  if (!user.organization_id) {
    return { query: baseQuery, params };
  }

  const hasWhere = baseQuery.toLowerCase().includes('where');

  const query = hasWhere
    ? `${baseQuery} AND organization_id = ?`
    : `${baseQuery} WHERE organization_id = ?`;

  return {
    query,
    params: [...params, user.organization_id],
  };
}
