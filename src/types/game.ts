export interface GameUser {
  first_name?: string | null;
  username?: string | null;
}

export interface GameRegistration {
  user_id: number;
  status: 'GOING' | 'NOT_GOING' | 'MAYBE';
  user: GameUser;
}

export interface GameLineup {
  id: string;
  name: string;
  score?: number | null;
  players?: { user_id: number; user: GameUser }[];
}

export interface Game {
  id: string;
  date: string;
  location?: string | null;
  registrations?: GameRegistration[];
  lineups?: GameLineup[];
}
