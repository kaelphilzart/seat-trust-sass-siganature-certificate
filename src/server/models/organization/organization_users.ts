import { User } from '../auth/users';

export interface OrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: Date;
  user?: User;
}
