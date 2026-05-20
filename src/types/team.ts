import { User } from './user';

export type TeamRole = 'ADMIN' | 'COACH' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  telegram_chat_id?: string | number | bigint | null;
  role?: TeamRole;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  user_id: number;
  team_id: string;
  role: TeamRole;
  created_at?: string;
  user?: User;
}

export interface TeamSchedule {
  id: string;
  team_id: string;
  day_of_week: number;
  time: string;
  location?: string | null;
  created_at?: string;
}
