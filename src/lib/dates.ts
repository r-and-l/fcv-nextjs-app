/** Проверяет, что дата приходится на сегодня (локальное время) */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatGameDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatGameTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Делит игры на «эта неделя» и «следующие» */
export function splitGamesByWeek<T extends { date: Date | string }>(games: T[]) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const daysToSunday = 7 - dayOfWeek;

  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    thisWeek: games.filter((g) => new Date(g.date) <= endOfWeek),
    nextWeek: games.filter((g) => new Date(g.date) > endOfWeek),
  };
}
