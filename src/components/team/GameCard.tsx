'use client';

import { useRouter } from 'next/navigation';
import type { Game } from '@/types';
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
      className={`p-4 rounded-2xl glass-panel transition-all duration-300 hover:shadow-md ${
        today
          ? 'stadium-glow border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent'
          : 'bg-white/60 dark:bg-zinc-900/60'
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
        className="w-full py-2.5 mb-4 flex justify-center items-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 cursor-pointer text-sm"
      >
        <span>📋</span>
        <span>Составы на игру</span>
      </button>

      <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
        <span className="flex items-center gap-1">🟢 Идут: <strong className="text-zinc-800 dark:text-zinc-200">{getGoingCount(game)}</strong></span>
        <span className="flex items-center gap-1">🔴 Не идут: <strong className="text-zinc-800 dark:text-zinc-200">{getNotGoingCount(game)}</strong></span>
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
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {formatGameDate(game.date)}
          </div>
          {today && (
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full stadium-glow-sm">
              Матч-день
            </span>
          )}
        </div>
        <div className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
          <span>⏰ {formatGameTime(game.date)}</span>
          {game.location && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="truncate max-w-[200px]" title={game.location}>📍 {game.location}</span>
            </>
          )}
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
          className="text-red-500 hover:text-white p-2 hover:bg-red-500 bg-red-500/10 dark:bg-red-500/10 rounded-xl transition-all duration-200 shrink-0 cursor-pointer active:scale-90"
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
    <div className="grid grid-cols-2 gap-2 mb-3">
      <button
        onClick={onGoing}
        className={`py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1 ${
          myStatus === 'GOING'
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-600'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <span>✅</span> Иду
      </button>
      <button
        onClick={onNotGoing}
        className={`py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1 ${
          myStatus === 'NOT_GOING'
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border border-rose-600'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <span>❌</span> Не иду
      </button>
    </div>
  );
}
