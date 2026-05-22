import { User } from './user';

export type TeamRole = 'ADMIN' | 'COACH' | 'MEMBER';

export interface Team {
  id: string;
  name: string | null;
  telegram_chat_id?: string | number | bigint | null;
  role?: TeamRole;
  created_at?: Date | string;
  updated_at?: Date | string;
  default_reminder_hours?: number | null;
  default_reminder_text?: string | null;
  game_announce_hours?: number | null;
}

export interface MyTeam extends Team {
  role: TeamRole;
}

export interface TeamMember {
  user_id: number | bigint;
  team_id: string;
  role: TeamRole;
  created_at?: Date | string;
  user?: User;
}

export type TeamMemberWithUser = TeamMember & { user: User };

export interface TeamSchedule {
  id: string;
  team_id: string;
  day_of_week: number;
  time: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: Date | string;
}
