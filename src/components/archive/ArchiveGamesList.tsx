'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { Game, GameLineup } from '@/types/game';
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
  onDelete: (gameId: string) => Promise<void>;
}

export function ArchiveGamesList({ games, teamId, isAdmin, onUpdateScore, onDelete }: ArchiveGamesListProps) {
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
          onDelete={onDelete}
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
  onDelete,
}: {
  game: Game;
  teamId: string;
  isAdmin: boolean;
  onUpdateScore: (gameId: string, lineupId: string, score: number | null) => Promise<void>;
  onDelete: (gameId: string) => Promise<void>;
}) {
  const router = useRouter();

  const isTournament = (game.lineups?.length || 0) >= 3;
  const tournamentSummary = useMemo(() => {
    if (!isTournament) return null;
    const miniGames = game.mini_games || [];
    if (miniGames.length === 0) {
      return `Турнир: ${game.lineups?.length || 0} составов`;
    }

    const statsMap: Record<string, { name: string; points: number; diff: number }> = {};
    game.lineups?.forEach((l) => {
      statsMap[l.id] = { name: l.name, points: 0, diff: 0 };
    });

    let playedCount = 0;
    miniGames.forEach((mg) => {
      const home = statsMap[mg.home_lineup_id];
      const away = statsMap[mg.away_lineup_id];
      if (home && away && mg.home_score !== null && mg.away_score !== null) {
        playedCount++;
        home.diff += mg.home_score - mg.away_score;
        away.diff += mg.away_score - mg.home_score;
        if (mg.home_score > mg.away_score) {
          home.points += 3;
        } else if (mg.home_score < mg.away_score) {
          away.points += 3;
        } else {
          home.points += 1;
          away.points += 1;
        }
      }
    });

    if (playedCount === 0) {
      return `Турнир: ${game.lineups?.length || 0} составов (игры не начаты)`;
    }

    const sorted = Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.diff - a.diff;
    });

    const isAllFinished = playedCount === miniGames.length;
    const prefix = isAllFinished ? '🏆 Победитель' : ' Лидер';
    return `${prefix}: ${sorted[0].name} (${sorted[0].points} очков)`;
  }, [game.lineups, game.mini_games, isTournament]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
      <div className="mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex justify-between items-start">
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {formatInMoscow(game.date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              if (
                confirm(
                  'Вы уверены, что хотите удалить эту архивную игру? Это действие необратимо.'
                )
              ) {
                onDelete(game.id);
              }
            }}
            className="text-red-500 hover:text-white p-1.5 hover:bg-red-500 bg-red-500/10 dark:bg-red-500/10 rounded-lg transition-all duration-200 shrink-0 cursor-pointer active:scale-90 text-xs"
            title="Удалить архивную игру"
          >
            🗑️
          </button>
        )}
      </div>

      {isTournament ? (
        <div className="mb-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {tournamentSummary}
          </span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Турнир
          </span>
        </div>
      ) : hasTwoLineups(game.lineups) ? (
        <div className="mb-2">
          {isAdmin ? (
            <GameScorePanel
              lineups={game.lineups as [GameLineup, GameLineup]}
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
