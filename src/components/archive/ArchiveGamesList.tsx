'use client';

import type { Game } from '@/types/game';
import { getGoingCount, hasTwoLineups } from '@/lib/game';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchScoreDisplay } from '@/components/lineups/MatchScoreDisplay';
import { formatInMoscow } from '@/lib/timezone';

interface ArchiveGamesListProps {
  games: Game[];
}

export function ArchiveGamesList({ games }: ArchiveGamesListProps) {
  if (games.length === 0) {
    return <EmptyState message="Нет прошедших игр" />;
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <ArchiveGameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

function ArchiveGameCard({ game }: { game: Game }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
      <div className="mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {formatInMoscow(game.date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {hasTwoLineups(game.lineups) ? (
        <div className="mb-2">
          <MatchScoreDisplay lineups={game.lineups} />
        </div>
      ) : (
        <div className="text-sm text-zinc-500 text-center mb-2">Счет не записан</div>
      )}

      <div className="text-xs text-zinc-400 text-center">Участников: {getGoingCount(game)}</div>
    </div>
  );
}
