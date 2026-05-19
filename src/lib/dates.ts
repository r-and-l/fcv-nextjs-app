import {
  APP_TIMEZONE,
  formatInMoscow,
  getEndOfWeekMoscow,
  isTodayInMoscow,
} from '@/lib/timezone';

export { isTodayInMoscow as isToday };

export function formatGameDate(date: Date | string): string {
  return formatInMoscow(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatGameTime(date: Date | string): string {
  return formatInMoscow(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Делит игры на «эта неделя» и «следующие» (по московскому календарю) */
export function splitGamesByWeek<T extends { date: Date | string }>(games: T[]) {
  const endOfWeek = getEndOfWeekMoscow();

  return {
    thisWeek: games.filter((g) => new Date(g.date) <= endOfWeek),
    nextWeek: games.filter((g) => new Date(g.date) > endOfWeek),
  };
}

export { APP_TIMEZONE };
