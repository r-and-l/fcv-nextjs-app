import React, { useMemo } from 'react';
import type { GameLineup } from '@/types/game';

interface MiniGame {
  id: string;
  home_lineup_id: string;
  away_lineup_id: string;
  home_score: number | null;
  away_score: number | null;
}

interface TournamentTableProps {
  lineups: GameLineup[];
  miniGames: MiniGame[];
}

interface StandingsEntry {
  lineupId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export function TournamentTable({ lineups, miniGames }: TournamentTableProps) {
  const standings = useMemo(() => {
    // Initialize stats map for each lineup
    const statsMap: Record<string, StandingsEntry> = {};
    lineups.forEach((l) => {
      statsMap[l.id] = {
        lineupId: l.id,
        name: l.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      };
    });

    // Populate stats from completed mini games
    miniGames.forEach((mg) => {
      const home = statsMap[mg.home_lineup_id];
      const away = statsMap[mg.away_lineup_id];

      // If lineup still exists and match was played
      if (home && away && mg.home_score !== null && mg.away_score !== null) {
        home.played += 1;
        away.played += 1;

        home.goalsFor += mg.home_score;
        home.goalsAgainst += mg.away_score;
        away.goalsFor += mg.away_score;
        away.goalsAgainst += mg.home_score;

        if (mg.home_score > mg.away_score) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (mg.home_score < mg.away_score) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          home.points += 1;
          away.draws += 1;
          away.points += 1;
        }
      }
    });

    // Convert to array and sort:
    // 1. Points desc
    // 2. Goal difference desc (goalsFor - goalsAgainst)
    // 3. Goals scored desc (goalsFor)
    return Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      return b.goalsFor - a.goalsFor;
    });
  }, [lineups, miniGames]);

  if (lineups.length < 3) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          🏆 Турнирная таблица
        </h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">3+ состава</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-2">Команда</th>
              <th className="py-3 px-2 text-center w-12" title="Игры">И</th>
              <th className="py-3 px-2 text-center w-10" title="Победы">В</th>
              <th className="py-3 px-2 text-center w-10" title="Ничьи">Н</th>
              <th className="py-3 px-2 text-center w-10" title="Поражения">П</th>
              <th className="py-3 px-2 text-center w-16" title="Мячи (Забито - Пропущено)">Мячи</th>
              <th className="py-3 px-4 text-center w-14 text-emerald-600 dark:text-emerald-400 font-bold">Очки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {standings.map((team, idx) => {
              const diff = team.goalsFor - team.goalsAgainst;
              const diffText = diff > 0 ? `+${diff}` : diff;
              
              // Styling for top positions
              const isLeader = idx === 0;
              const rowBg = isLeader 
                ? 'bg-emerald-500/5 dark:bg-emerald-500/5' 
                : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20';

              return (
                <tr key={team.lineupId} className={`text-sm transition-colors duration-150 ${rowBg}`}>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                      idx === 0 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' 
                        : idx === 1
                        ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {team.name}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                    {team.played}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-500 dark:text-zinc-400">
                    {team.wins}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-500 dark:text-zinc-400">
                    {team.draws}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-500 dark:text-zinc-400">
                    {team.losses}
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {team.goalsFor}:{team.goalsAgainst} <span className={`text-[10px] font-semibold ${
                      diff > 0 
                        ? 'text-emerald-500' 
                        : diff < 0 
                        ? 'text-red-500' 
                        : 'text-zinc-450'
                    }`}>({diffText})</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {team.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
