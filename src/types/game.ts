export interface GameUser {
  first_name?: string | null;
  username?: string | null;
  position?: string | null;
}

export interface GameRegistration {
  user_id: number | bigint;
  status: 'GOING' | 'NOT_GOING' | 'MAYBE';
  user: GameUser;
}

export interface GameLineup {
  id: string;
  name: string;
  score?: number | null;
  players?: { user_id: number | bigint; user: GameUser }[];
}

export interface MiniGame {
  id: string;
  game_id: string;
  home_lineup_id: string;
  away_lineup_id: string;
  home_score: number | null;
  away_score: number | null;
  home_lineup?: GameLineup;
  away_lineup?: GameLineup;
}

export interface Game {
  id: string;
  date: string | Date;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  duration?: number | null;
  reminder_hours?: number | null;
  reminder_text?: string | null;
  reminder_sent?: boolean;
  registrations?: GameRegistration[];
  lineups?: GameLineup[];
  mini_games?: MiniGame[];
}

export interface GameSchedule {
  id: string;
  team_id: string;
  day_of_week: number;
  time: string;
  location?: string | null;
  duration?: number;
  created_at?: string | Date;
}
