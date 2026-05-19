/** Все игры и расписание — по московскому времени */
export const APP_TIMEZONE = 'Europe/Moscow';

const moscowDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const moscowWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIMEZONE,
  weekday: 'short',
});

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** "2026-05-21" + "17:00" → момент времени (UTC в Date) */
export function parseMoscowDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return new Date(`${date}T${hh}:${mm}:00+03:00`);
}

export function formatInMoscow(
  date: Date | string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleString('ru-RU', { ...options, timeZone: APP_TIMEZONE });
}

export function getMoscowDateString(date: Date = new Date()): string {
  return moscowDateFormatter.format(date);
}

export function getMoscowWeekday(date: Date): number {
  const weekday = moscowWeekdayFormatter.format(date);
  return WEEKDAY_MAP[weekday] ?? 0;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const noon = parseMoscowDateTime(dateStr, '12:00');
  noon.setUTCDate(noon.getUTCDate() + days);
  return getMoscowDateString(noon);
}

export function isTodayInMoscow(date: Date | string): boolean {
  return getMoscowDateString(new Date(date)) === getMoscowDateString();
}

/** Конец текущей недели (воскресенье 23:59:59.999 МСК) */
export function getEndOfWeekMoscow(): Date {
  const now = new Date();
  const weekday = getMoscowWeekday(now);
  const daysToSunday = weekday === 0 ? 0 : 7 - weekday;
  const endDateStr = addDaysToDateString(getMoscowDateString(now), daysToSunday);
  return parseMoscowDateTime(endDateStr, '23:59');
}
