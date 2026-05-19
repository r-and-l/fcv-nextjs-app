'use client';

import { useState } from 'react';
import type { GameLineup } from '@/types/game';
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
    <Card padding="sm" className="text-center">
      <h2 className="text-sm font-bold text-zinc-500 mb-3 uppercase">Результат матча</h2>

      <div className="flex items-center justify-center space-x-6">
        <div className="text-right flex-1 font-medium">{pair[0].name}</div>

        {isEditing ? (
          <ScoreEditor
            score1={score1}
            score2={score2}
            onScore1Change={setScore1}
            onScore2Change={setScore2}
          />
        ) : (
          <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-800 px-6 py-3 rounded-2xl">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {pair[0].score ?? '-'}
            </span>
            <span className="text-xl font-bold text-zinc-300">:</span>
            <span className="text-3xl font-bold text-red-600 dark:text-red-400">
              {pair[1].score ?? '-'}
            </span>
          </div>
        )}

        <div className="text-left flex-1 font-medium">{pair[1].name}</div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <button
            onClick={saveScores}
            className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
          >
            Сохранить
          </button>
        ) : (
          <button
            onClick={startEdit}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ✏️ Изменить счет
          </button>
        )}
      </div>
    </Card>
  );
}
