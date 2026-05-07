export function getTodayString(): string {
  const d = new Date();
  return formatDate(d);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function isWeekday(date: Date): boolean {
  const dow = date.getDay();
  return dow !== 0 && dow !== 6;
}

export function getBusinessDaysInMonth(year: number, month: number): number {
  const days = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month - 1, d);
    if (isWeekday(date)) count++;
  }
  return count;
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export type OpeningOverride = 'open' | 'closed';

export function isOpenDay(dateStr: string, specialDates: Record<string, OpeningOverride>): boolean {
  if (specialDates[dateStr] === 'open') return true;
  if (specialDates[dateStr] === 'closed') return false;
  return isWeekday(parseDate(dateStr));
}

export function getOpenDaysInMonth(
  year: number,
  month: number,
  specialDates: Record<string, OpeningOverride>
): number {
  const days = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isOpenDay(dateStr, specialDates)) count++;
  }
  return count;
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}
