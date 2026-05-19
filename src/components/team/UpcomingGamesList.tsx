'use client';

import { useRouter } from 'next/navigation';
import type { Game } from '@/types/game';
import { splitGamesByWeek } from '@/lib/dates';
import { GameCard } from './GameCard';
import { EmptyState } from '@/components/ui';

interface UpcomingGamesListProps {
  games: Game[];
  teamId: string;
  userId?: number;
  isAdmin: boolean;
  isLoading: boolean;
  onRegister: (gameId: string, status: 'GOING' | 'NOT_GOING') => void;
  onDelete: (gameId: string) => void;
  onUpdateScore?: (gameId: string, lineupId: string, score: number | null) => Promise<void>;
}

export function UpcomingGamesList({
  games,
  teamId,
  userId,
  isAdmin,
  isLoading,
  onRegister,
  onDelete,
  onUpdateScore,
}: UpcomingGamesListProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="text-lg font-bold">Предстоящие игры</h2>
        <button
          onClick={() => router.push(`/team/${teamId}/archive`)}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          Архив ➡️
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-4">Загрузка игр...</div>
      ) : games.length === 0 ? (
        <EmptyState message="Нет запланированных игр" />
      ) : (
        <GamesByWeek
          games={games}
          teamId={teamId}
          userId={userId}
          isAdmin={isAdmin}
          onRegister={onRegister}
          onDelete={onDelete}
          onUpdateScore={onUpdateScore}
        />
      )}
    </div>
  );
}

function GamesByWeek({
  games,
  teamId,
  userId,
  isAdmin,
  onRegister,
  onDelete,
  onUpdateScore,
}: Omit<UpcomingGamesListProps, 'isLoading'>) {
  const { thisWeek, nextWeek } = splitGamesByWeek(games);

  const cardProps = { teamId, userId, isAdmin, onRegister, onDelete, onUpdateScore };

  return (
    <div className="space-y-6">
      {thisWeek.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-500 px-1 uppercase tracking-wider">
            Эта неделя
          </h3>
          {thisWeek.map((game) => (
            <GameCard key={game.id} game={game} {...cardProps} />
          ))}
        </section>
      )}

      {nextWeek.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-500 px-1 uppercase tracking-wider">
            Следующие игры
          </h3>
          {nextWeek.map((game) => (
            <GameCard key={game.id} game={game} {...cardProps} />
          ))}
        </section>
      )}
    </div>
  );
}
