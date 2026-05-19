'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface ScheduleListProps {
  schedules: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function ScheduleList({ schedules, isLoading, onDelete }: ScheduleListProps) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3 px-1">Текущее расписание</h2>
      {isLoading ? (
        <div className="text-center text-zinc-500 py-4">Загрузка...</div>
      ) : schedules.length === 0 ? (
        <EmptyState message="Расписание не настроено. Бот не будет автоматически создавать игры." />
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {DAYS_OF_WEEK[s.day_of_week]}, {s.time}
                </div>
                {s.location && <div className="text-xs text-zinc-500 mt-1">📍 {s.location}</div>}
              </div>
              <button
                onClick={() => onDelete(s.id)}
                className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
