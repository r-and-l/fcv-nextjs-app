import type { Game, GameRegistration, GameLineup } from '@/types/game';

export function getGoingCount(game: Game): number {
  return game.registrations?.filter((r) => r.status === 'GOING').length ?? 0;
}

export function getNotGoingCount(game: Game): number {
  return game.registrations?.filter((r) => r.status === 'NOT_GOING').length ?? 0;
}

export function getMyRegistration(
  game: Game,
  userId?: number
): GameRegistration | undefined {
  if (!userId) return undefined;
  return game.registrations?.find((r) => r.user_id === userId);
}

export function hasTwoLineups(lineups?: GameLineup[]): lineups is [GameLineup, GameLineup] {
  return Array.isArray(lineups) && lineups.length === 2;
}
