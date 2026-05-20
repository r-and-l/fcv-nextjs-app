import React, { useState } from 'react';
import type { GameLineup } from '@/types/game';

interface MiniGame {
  id: string;
  home_lineup_id: string;
  away_lineup_id: string;
  home_score: number | null;
  away_score: number | null;
  home_lineup?: GameLineup;
  away_lineup?: GameLineup;
}

interface MiniGamesPanelProps {
  lineups: GameLineup[];
  miniGames: MiniGame[];
  canEdit: boolean;
  onUpdateScore: (miniGameId: string, homeScore: number | null, awayScore: number | null) => Promise<void>;
}

export function MiniGamesPanel({ lineups, miniGames, canEdit, onUpdateScore }: MiniGamesPanelProps) {
  const N = lineups.length;
  const matchesPerCircle = (N * (N - 1)) / 2;

  // Group matches by circle
  const circles = React.useMemo(() => {
    if (matchesPerCircle <= 0) return [];
    const result: MiniGame[][] = [];
    for (let i = 0; i < miniGames.length; i += matchesPerCircle) {
      result.push(miniGames.slice(i, i + matchesPerCircle));
    }
    return result;
  }, [miniGames, matchesPerCircle]);

  if (miniGames.length === 0) {
    return (
      <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Сетка матчей еще не сгенерирована.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {circles.map((circleMatches, circleIdx) => (
        <div key={circleIdx} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-1 flex items-center gap-2">
            <span>🔄 Круг {circleIdx + 1}</span>
            <span className="w-full h-px bg-zinc-100 dark:bg-zinc-800"></span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {circleMatches.map((mg, matchIdx) => (
              <MiniGameCard
                key={mg.id}
                mg={mg}
                matchNum={circleIdx * matchesPerCircle + matchIdx + 1}
                canEdit={canEdit}
                onUpdateScore={onUpdateScore}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniGameCard({
  mg,
  matchNum,
  canEdit,
  onUpdateScore,
}: {
  mg: MiniGame;
  matchNum: number;
  canEdit: boolean;
  onUpdateScore: (miniGameId: string, homeScore: number | null, awayScore: number | null) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  const homeName = mg.home_lineup?.name || 'Хозяева';
  const awayName = mg.away_lineup?.name || 'Гости';

  const homeScore = mg.home_score ?? 0;
  const awayScore = mg.away_score ?? 0;

  const handleScoreChange = async (side: 'home' | 'away', operation: 'inc' | 'dec' | 'clear') => {
    if (!canEdit || updating) return;
    setUpdating(true);

    let newHome = homeScore;
    let newAway = awayScore;

    if (side === 'home') {
      if (operation === 'inc') newHome = homeScore + 1;
      else if (operation === 'dec') newHome = Math.max(0, homeScore - 1);
      else newHome = 0;
    } else {
      if (operation === 'inc') newAway = awayScore + 1;
      else if (operation === 'dec') newAway = Math.max(0, awayScore - 1);
      else newAway = 0;
    }

    try {
      await onUpdateScore(mg.id, newHome, newAway);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-zinc-900 border rounded-xl flex items-center justify-between transition-all duration-200 border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Match Info & Home Team */}
      <div className="flex-1 flex flex-col min-w-0 pr-2">
        <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
          МАТЧ #{matchNum}
        </span>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-2">
              {homeName}
            </span>
            {canEdit ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={updating}
                  onClick={() => handleScoreChange('home', 'dec')}
                  className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {homeScore}
                </span>
                <button
                  disabled={updating}
                  onClick={() => handleScoreChange('home', 'inc')}
                  className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-sm font-bold shrink-0 text-zinc-900 dark:text-zinc-100">
                {homeScore}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-850/50 pt-1 mt-1">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-2">
              {awayName}
            </span>
            {canEdit ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={updating}
                  onClick={() => handleScoreChange('away', 'dec')}
                  className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {awayScore}
                </span>
                <button
                  disabled={updating}
                  onClick={() => handleScoreChange('away', 'inc')}
                  className="w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-sm font-bold shrink-0 text-zinc-900 dark:text-zinc-100">
                {awayScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clear/Reset score button for Admin */}
      {canEdit && (homeScore !== 0 || awayScore !== 0) && (
        <button
          onClick={async () => {
            if (confirm('Сбросить счет этого матча на 0-0?')) {
              setUpdating(true);
              try {
                await onUpdateScore(mg.id, 0, 0);
              } catch (e) {
                console.error(e);
              } finally {
                setUpdating(false);
              }
            }
          }}
          className="ml-2 p-1 text-zinc-350 hover:text-red-500 rounded hover:bg-red-500/5 transition-all text-xs cursor-pointer shrink-0"
          title="Сбросить счет"
        >
          🔄
        </button>
      )}
    </div>
  );
}
