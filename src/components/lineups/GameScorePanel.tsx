'use client';

import { useState } from 'react';
import type { GameLineup } from '@/types/game';
import { ScoreEditor } from './ScoreEditor';
import { MatchScoreDisplay } from './MatchScoreDisplay';

interface GameScorePanelProps {
  lineups: [GameLineup, GameLineup];
  onUpdateScore: (lineupId: string, score: number | null) => Promise<void>;
  compact?: boolean;
  canEdit?: boolean;
}

export function GameScorePanel({ lineups, onUpdateScore, compact = false, canEdit = true }: GameScorePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [score1, setScore1] = useState<number | ''>('');
  const [score2, setScore2] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setScore1(lineups[0].score ?? '');
    setScore2(lineups[1].score ?? '');
    setIsEditing(true);
  };

  const saveScores = async () => {
    setIsSaving(true);
    await onUpdateScore(lineups[0].id, score1 === '' ? null : Number(score1));
    await onUpdateScore(lineups[1].id, score2 === '' ? null : Number(score2));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/30 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 text-center">
        Счёт матча
      </div>

      {isEditing ? (
        <div className="flex flex-col items-center gap-3">
          <ScoreEditor
            score1={score1}
            score2={score2}
            onScore1Change={setScore1}
            onScore2Change={setScore2}
            size="sm"
          />
          <button
            onClick={saveScores}
            disabled={isSaving}
            className="px-5 py-2 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <MatchScoreDisplay lineups={lineups} size={compact ? 'sm' : 'lg'} />
          {canEdit && (
            <button
              onClick={startEdit}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              ✏️ {lineups[0].score != null ? 'Изменить счёт' : 'Ввести счёт'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
