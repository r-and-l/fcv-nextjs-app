export interface User {
  id: number | bigint;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  position?: string | null;
  phone?: string | null;
  created_at?: Date | string;
}

export interface ProfileUpdateData {
  first_name?: string | null;
  last_name?: string | null;
  position?: string | null;
  phone?: string | null;
}
