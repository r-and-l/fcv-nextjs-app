'use client';

import { useRouter } from 'next/navigation';
import type { Game } from '@/types/game';
import { isToday, formatGameDate, formatGameTime } from '@/lib/dates';
import { getGoingCount, getNotGoingCount, getMyRegistration, hasTwoLineups } from '@/lib/game';
import { GameScorePanel } from '@/components/lineups';

interface GameCardProps {
  game: Game;
  teamId: string;
  userId?: number;
  isAdmin: boolean;
  onRegister: (gameId: string, status: 'GOING' | 'NOT_GOING') => void;
  onDelete: (gameId: string) => void;
  onUpdateScore?: (gameId: string, lineupId: string, score: number | null) => Promise<void>;
}

export function GameCard({
  game,
  teamId,
  userId,
  isAdmin,
  onRegister,
  onDelete,
  onUpdateScore,
}: GameCardProps) {
  const router = useRouter();
  const today = isToday(game.date);
  const myReg = getMyRegistration(game, userId);

  return (
    <div
      className={`p-4 rounded-2xl shadow-sm transition-all ${
        today
          ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <GameCardHeader
        game={game}
        isToday={today}
        isAdmin={isAdmin}
        onDelete={() => onDelete(game.id)}
      />

      {today && hasTwoLineups(game.lineups) && onUpdateScore && (
        <div className="mb-4">
          <GameScorePanel
            lineups={game.lineups}
            compact
            onUpdateScore={(lineupId, score) => onUpdateScore(game.id, lineupId, score)}
          />
        </div>
      )}

      <RegistrationButtons
        myStatus={myReg?.status}
        onGoing={() => onRegister(game.id, 'GOING')}
        onNotGoing={() => onRegister(game.id, 'NOT_GOING')}
      />

      <button
        onClick={() => router.push(`/team/${teamId}/games/${game.id}/lineups`)}
        className="w-full py-2 mb-4 flex justify-center items-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      >
        <span>📋</span>
        <span>Составы на игру</span>
      </button>

      <div className="flex justify-between text-xs text-zinc-500 px-1">
        <span>Идут: {getGoingCount(game)}</span>
        <span>Не идут: {getNotGoingCount(game)}</span>
      </div>
    </div>
  );
}

function GameCardHeader({
  game,
  isToday: today,
  isAdmin,
  onDelete,
}: {
  game: Game;
  isToday: boolean;
  isAdmin: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatGameDate(game.date)}
          </div>
          {today && (
            <span className="text-xs font-bold uppercase tracking-wide bg-blue-500 text-white px-2 py-0.5 rounded-full">
              Сегодня
            </span>
          )}
        </div>
        <div className="text-zinc-500 text-sm mt-1">
          ⏰ {formatGameTime(game.date)}
          {game.location && ` • 📍 ${game.location}`}
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => {
            if (
              confirm(
                'Вы уверены, что хотите удалить эту игру? Сообщение в группе тоже будет удалено.'
              )
            ) {
              onDelete();
            }
          }}
          className="text-red-500 hover:text-red-600 p-2 bg-red-50 dark:bg-red-500/10 rounded-xl transition-colors shrink-0"
          title="Удалить игру"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

function RegistrationButtons({
  myStatus,
  onGoing,
  onNotGoing,
}: {
  myStatus?: string;
  onGoing: () => void;
  onNotGoing: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <button
        onClick={onGoing}
        className={`py-2 rounded-xl font-medium transition-all active:scale-[0.98] ${
          myStatus === 'GOING'
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        {myStatus === 'GOING' ? '' : '✅'} Иду
      </button>
      <button
        onClick={onNotGoing}
        className={`py-2 rounded-xl font-medium transition-all active:scale-[0.98] ${
          myStatus === 'NOT_GOING'
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        {myStatus === 'NOT_GOING' ? '' : '❌'} Не иду
      </button>
    </div>
  );
}
