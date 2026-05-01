export type UserRole = 'admin' | 'client';

export interface User {
  id_user: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
