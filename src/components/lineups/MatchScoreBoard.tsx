'use client';

import { useState } from 'react';
import type { GameLineup } from '@/types';
import { Card } from '@/components/ui/Card';
import { ScoreEditor } from './ScoreEditor';

interface MatchScoreBoardProps {
  lineups: GameLineup[];
  onUpdateScore: (lineupId: string, score: number | null) => Promise<void>;
}

export function MatchScoreBoard({ lineups, onUpdateScore }: MatchScoreBoardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [score1, setScore1] = useState<number | ''>('');
  const [score2, setScore2] = useState<number | ''>('');

  if (lineups.length !== 2) return null;

  const pair = lineups as [GameLineup, GameLineup];

  const startEdit = () => {
    setScore1(pair[0].score ?? '');
    setScore2(pair[1].score ?? '');
    setIsEditing(true);
  };

  const saveScores = async () => {
    await onUpdateScore(pair[0].id, score1 === '' ? null : Number(score1));
    await onUpdateScore(pair[1].id, score2 === '' ? null : Number(score2));
    setIsEditing(false);
  };

  return (
    <Card padding="sm" className="text-center bg-gradient-to-b from-zinc-950 to-zinc-900 border-zinc-800 shadow-lg relative overflow-hidden stadium-glow">
      {/* Background highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 tracking-widest uppercase">ТАБЛО МАТЧА</h2>

      <div className="flex items-center justify-between px-3 md:px-6 py-2">
        <div className="text-right flex-1 font-semibold text-zinc-200 truncate pr-3">{pair[0].name}</div>

        {isEditing ? (
          <ScoreEditor
            score1={score1}
            score2={score2}
            onScore1Change={setScore1}
            onScore2Change={setScore2}
          />
        ) : (
          <div className="flex items-center space-x-4 bg-black/60 border border-zinc-800/80 px-5 py-2.5 rounded-2xl shadow-inner font-mono">
            <span className="text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] min-w-[20px] text-center">
              {pair[0].score ?? '-'}
            </span>
            <span className="text-xl font-bold text-zinc-600 animate-pulse">:</span>
            <span className="text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] min-w-[20px] text-center">
              {pair[1].score ?? '-'}
            </span>
          </div>
        )}

        <div className="text-left flex-1 font-semibold text-zinc-200 truncate pl-3">{pair[1].name}</div>
      </div>

      <div className="mt-3.5 mb-1">
        {isEditing ? (
          <button
            onClick={saveScores}
            className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs tracking-wider uppercase active:scale-95 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            Сохранить
          </button>
        ) : (
          <button
            onClick={startEdit}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium cursor-pointer"
          >
            ✏️ Изменить счет
          </button>
        )}
      </div>
    </Card>
  );
}
