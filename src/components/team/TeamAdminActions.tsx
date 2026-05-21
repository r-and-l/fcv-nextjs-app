'use client';

import { useRouter } from 'next/navigation';

export function TeamAdminActions({ teamId }: { teamId: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.push(`/team/${teamId}/admin`)}
        className="flex-1 flex items-center justify-center space-x-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl transition-colors font-medium border border-blue-500/20"
      >
        <span>⚙️</span>
        <span>Расписание</span>
      </button>
      <button
        onClick={() => router.push(`/team/${teamId}/members`)}
        className="flex-1 flex items-center justify-center space-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 py-3 rounded-xl transition-colors font-medium border border-purple-500/20"
      >
        <span>👥</span>
        <span>Участники</span>
      </button>
    </div>
  );
}
