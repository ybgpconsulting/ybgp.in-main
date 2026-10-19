export const BUSINESS_DAYS = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
] as const;

export type BusinessDay = typeof BUSINESS_DAYS[number]['key'];
export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}
export type WeeklyHours = Record<BusinessDay, DayHours>;

export const createDefaultWeeklyHours = (): WeeklyHours => Object.fromEntries(
  BUSINESS_DAYS.map(({ key }) => [key, { closed: true, open: '09:00', close: '17:00' }])
) as WeeklyHours;

const isTime = (value: unknown): value is string =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const parseWeeklyHours = (value: string | null | undefined): WeeklyHours | null => {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const schedule = createDefaultWeeklyHours();
    for (const { key } of BUSINESS_DAYS) {
      const day = parsed[key];
      if (typeof day !== 'object' || day === null || Array.isArray(day)) return null;
      const hours = day as Record<string, unknown>;
      if (typeof hours.closed !== 'boolean' || !isTime(hours.open) || !isTime(hours.close)) return null;
      if (!hours.closed && hours.open >= hours.close) return null;
      schedule[key] = { closed: hours.closed, open: hours.open, close: hours.close };
    }
    return schedule;
  } catch {
    return null;
  }
};

export const isValidWorkingHoursValue = (value: string): boolean => {
  if (value.length > 500) return false;
  if (!value.trim()) return true;
  if (!value.trimStart().startsWith('{')) return true;
  return parseWeeklyHours(value) !== null;
};

export const formatWorkingHours = (value: string | null | undefined): string => {
  const schedule = parseWeeklyHours(value);
  if (!schedule) return value?.trim() ?? '';
  return BUSINESS_DAYS.map(({ key, shortLabel }) => {
    const hours = schedule[key];
    return hours.closed ? `${shortLabel}: Closed` : `${shortLabel}: ${hours.open}–${hours.close}`;
  }).join(' · ');
};