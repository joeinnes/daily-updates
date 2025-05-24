/**
 * Utility functions for date handling and formatting
 */

/**
 * Gets the Monday of the week containing the given date
 */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Gets the ISO week number for a given date
 */
export function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Formats a date as a month key (YYYY-MM)
 */
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

/**
 * Gets the ISO date string (YYYY-MM-DD) from a date
 */
export function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}
