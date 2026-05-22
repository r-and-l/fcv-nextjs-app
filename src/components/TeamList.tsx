import { useRouter } from 'next/navigation';
import type { MyTeam } from '@/types';

export function TeamList({ teams, isLoading, error }: { teams: MyTeam[], isLoading: boolean, error: Error | null }) {
  const router = useRouter();

  if (isLoading) return <div className="text-center text-zinc-500 py-8">Загрузка команд...</div>;
  if (error) return <div className="text-center text-red-500 py-8">Ошибка загрузки команд</div>;

  if (teams.length === 0) {
    return (
      <div className="text-center py-10 bg-white/5 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md shadow-xl p-6">
        <div className="text-4xl mb-4 animate-bounce">⚽</div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">У вас пока нет команд</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Добавьте этого бота в вашу футбольную группу в Telegram, чтобы автоматически создать команду и управлять играми.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 px-1 tracking-wide">Мои Команды</h2>
      {teams.map((team) => {
        const isAdminOrCoach = team.role === 'ADMIN' || team.role === 'COACH';
        const badgeClasses = isAdminOrCoach
          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50';

        return (
          <button
            key={team.id}
            onClick={() => router.push(`/team/${team.id}`)}
            className="w-full text-left bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group flex items-center justify-between backdrop-blur-sm"
          >
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg group-hover:text-emerald-500 transition-colors">
                {team.name}
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-2 inline-block ${badgeClasses}`}>
                {team.role === 'ADMIN' ? 'Администратор' : team.role === 'COACH' ? 'Тренер' : 'Участник'}
              </span>
            </div>
            <div className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
