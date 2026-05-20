'use client';

import { useRouter } from 'next/navigation';
import type { Game } from '@/types/game';
import { getGoingCount, hasTwoLineups } from '@/lib/game';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchScoreDisplay } from '@/components/lineups/MatchScoreDisplay';
import { GameScorePanel } from '@/components/lineups/GameScorePanel';
import { formatInMoscow } from '@/lib/timezone';

interface ArchiveGamesListProps {
  games: Game[];
  teamId: string;
  isAdmin: boolean;
  onUpdateScore: (gameId: string, lineupId: string, score: number | null) => Promise<void>;
}

export function ArchiveGamesList({ games, teamId, isAdmin, onUpdateScore }: ArchiveGamesListProps) {
  if (games.length === 0) {
    return <EmptyState message="Нет прошедших игр" />;
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <ArchiveGameCard
          key={game.id}
          game={game}
          teamId={teamId}
          isAdmin={isAdmin}
          onUpdateScore={onUpdateScore}
        />
      ))}
    </div>
  );
}

function ArchiveGameCard({
  game,
  teamId,
  isAdmin,
  onUpdateScore,
}: {
  game: Game;
  teamId: string;
  isAdmin: boolean;
  onUpdateScore: (gameId: string, lineupId: string, score: number | null) => Promise<void>;
}) {
  const router = useRouter();

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
          {isAdmin ? (
            <GameScorePanel
              lineups={game.lineups as [any, any]}
              compact
              onUpdateScore={(lineupId, score) => onUpdateScore(game.id, lineupId, score)}
            />
          ) : (
            <MatchScoreDisplay lineups={game.lineups} />
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-500 text-center mb-2">Счет не записан</div>
      )}

      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <span className="text-xs text-zinc-500">Участников: {getGoingCount(game)}</span>
        <button
          onClick={() => router.push(`/team/${teamId}/games/${game.id}/lineups`)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          📋 Составы на игру →
        </button>
      </div>
    </div>
  );
}
