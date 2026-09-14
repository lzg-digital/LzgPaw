export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner';
  active: boolean;
}
