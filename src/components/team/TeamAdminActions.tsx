'use client';

import { useRouter } from 'next/navigation';

export function TeamAdminActions({ teamId }: { teamId: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.push(`/team/${teamId}/admin`)}
        className="flex-1 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl transition-all duration-150 font-semibold border border-blue-500/20 active:scale-[0.98] cursor-pointer text-sm gap-2"
      >
        <span className="icon-badge icon-badge-blue">⚙️</span>
        <span>Расписание</span>
      </button>
      <button
        onClick={() => router.push(`/team/${teamId}/members`)}
        className="flex-1 flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 py-2.5 rounded-xl transition-all duration-150 font-semibold border border-purple-500/20 active:scale-[0.98] cursor-pointer text-sm gap-2"
      >
        <span className="icon-badge icon-badge-purple">👥</span>
        <span>Участники</span>
      </button>
    </div>
  );
}
