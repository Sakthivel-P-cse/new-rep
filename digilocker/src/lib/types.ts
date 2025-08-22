export type UserRole = 'admin' | 'student' | 'org';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

