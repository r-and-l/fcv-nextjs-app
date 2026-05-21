'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
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

  const now = new Date();
  const gameEndTime = new Date(new Date(game.date).getTime() + (game.duration || 60) * 60 * 1000);
  const isFinished = now > gameEndTime;
  const canEditScore = !isFinished || isAdmin;

  const myAssignedLineup = useMemo(() => {
    if (!game.lineups || !userId) return null;
    return game.lineups.find((l) =>
      l.players?.some((p) => String(p.user_id) === String(userId))
    );
  }, [game.lineups, userId]);

  const lineupBadgeColors = useMemo(() => {
    if (!myAssignedLineup) return null;
    const name = myAssignedLineup.name.toLowerCase();
    if (name.includes('красн') || name.includes('red')) {
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-500/20 dark:border-rose-500/15';
    }
    if (name.includes('зелен') || name.includes('зелён') || name.includes('green')) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20 dark:border-emerald-500/15';
    }
    if (name.includes('син') || name.includes('blue')) {
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-455 border-blue-500/20 dark:border-blue-500/15';
    }
    if (name.includes('желт') || name.includes('жёлт') || name.includes('yellow')) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-455 border-amber-500/20 dark:border-amber-500/15';
    }
    return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/15';
  }, [myAssignedLineup]);

  const isTournament = (game.lineups?.length || 0) >= 3;
  const tournamentSummary = useMemo(() => {
    if (!isTournament) return null;
    const miniGames = game.mini_games || [];
    if (miniGames.length === 0) {
      return `Турнир: ${game.lineups?.length || 0} команд`;
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
      return `Турнир: ${game.lineups?.length || 0} команд (матчи не начаты)`;
    }

    const sorted = Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.diff - a.diff;
    });

    return `Лидер: ${sorted[0].name} (${sorted[0].points} очков, сыграно ${playedCount}/${miniGames.length})`;
  }, [game.lineups, game.mini_games, isTournament]);

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

      {isTournament ? (
        <div className="mb-4 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <span className="icon-badge icon-badge-amber w-6 h-6 text-xs shadow-sm shadow-amber-500/5">🏆</span>
            <span>{tournamentSummary}</span>
          </span>
        </div>
      ) : (
        today && hasTwoLineups(game.lineups) && onUpdateScore && (
          <div className="mb-4">
            <GameScorePanel
              lineups={game.lineups}
              compact
              canEdit={canEditScore}
              onUpdateScore={(lineupId, score) => onUpdateScore(game.id, lineupId, score)}
            />
          </div>
        )
      )}

      {myAssignedLineup && lineupBadgeColors && (
        <div className={`mb-3.5 pl-2 pr-3 py-1.5 border rounded-xl flex items-center justify-between text-xs font-semibold ${lineupBadgeColors}`}>
          <span className="flex items-center gap-2">
            <span className="icon-badge icon-badge-blue w-6 h-6 text-[11px] shadow-sm shadow-blue-500/5">🎮</span>
            <span>Вы в составе:</span>
          </span>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            {myAssignedLineup.name}
          </span>
        </div>
      )}

      <RegistrationButtons
        myStatus={myReg?.status}
        onGoing={() => onRegister(game.id, 'GOING')}
        onNotGoing={() => onRegister(game.id, 'NOT_GOING')}
      />

      <button
        onClick={() => router.push(`/team/${teamId}/games/${game.id}/lineups`)}
        className="w-full pl-2.5 pr-4 py-2 mb-4 flex justify-center items-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 cursor-pointer text-sm"
      >
        <span className="icon-badge icon-badge-emerald w-6 h-6 text-xs shadow-sm shadow-emerald-500/5">📋</span>
        <span>Составы на игру</span>
      </button>

      <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1 items-center">
        <span className="flex items-center gap-1.5">
          <span className="icon-badge icon-badge-emerald w-5 h-5 text-[8px] border-emerald-500/10">🟢</span>
          <span>Идут: <strong className="text-zinc-800 dark:text-zinc-200">{getGoingCount(game)}</strong></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="icon-badge icon-badge-rose w-5 h-5 text-[8px] border-rose-500/10">🔴</span>
          <span>Не идут: <strong className="text-zinc-800 dark:text-zinc-200">{getNotGoingCount(game)}</strong></span>
        </span>
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
        <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-2.5 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="icon-badge w-6 h-6 text-[10px] bg-zinc-200/50 dark:bg-zinc-800/60 border-zinc-250/20 dark:border-zinc-700/20">⏰</span>
            <span>{formatGameTime(game.date)}</span>
          </span>
          {game.location && (
            <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={game.location}>
              <span className="icon-badge w-6 h-6 text-[10px] bg-zinc-200/50 dark:bg-zinc-800/60 border-zinc-250/20 dark:border-zinc-700/20">📍</span>
              <span>{game.location}</span>
            </span>
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
          className="text-red-500 hover:text-white p-2 hover:bg-red-500 bg-red-500/10 dark:bg-red-500/10 rounded-xl transition-all duration-200 shrink-0 cursor-pointer active:scale-90 flex items-center justify-center w-8 h-8 text-xs border border-red-500/20"
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
        className={`py-2 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1.5 ${
          myStatus === 'GOING'
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-600'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <span className={`${myStatus === 'GOING' ? 'text-white' : 'text-emerald-500'} font-bold`}>✅</span>
        <span>Иду</span>
      </button>
      <button
        onClick={onNotGoing}
        className={`py-2 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-1.5 ${
          myStatus === 'NOT_GOING'
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border border-rose-600'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <span className={`${myStatus === 'NOT_GOING' ? 'text-white' : 'text-rose-500'} font-bold`}>❌</span>
        <span>Не иду</span>
      </button>
    </div>
  );
}
