/**
 * Date formatting and manipulation utilities
 */
import dayjs from "dayjs";

/**
 * Format a date into a human-readable string (e.g., "January 1, 2023")
 * @param date - Date object or string to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  return dayjs(date).format("MMMM D, YYYY");
}

/**
 * Format a date to include time (e.g., "January 1, 2023 at 12:00 PM")
 * @param date - Date object or string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  return dayjs(date).format("MMMM D, YYYY [at] h:mm A");
}

/**
 * Get a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param date - Date object or string to format
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffInSeconds = target.diff(now, "second");

  if (Math.abs(diffInSeconds) < 60) {
    return diffInSeconds < 0 ? "just now" : "in a few seconds";
  }

  const diffInMinutes = target.diff(now, "minute");
  if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes < 0
      ? `${Math.abs(diffInMinutes)} minute${
          Math.abs(diffInMinutes) !== 1 ? "s" : ""
        } ago`
      : `in ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
  }

  const diffInHours = target.diff(now, "hour");
  if (Math.abs(diffInHours) < 24) {
    return diffInHours < 0
      ? `${Math.abs(diffInHours)} hour${
          Math.abs(diffInHours) !== 1 ? "s" : ""
        } ago`
      : `in ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
  }

  const diffInDays = target.diff(now, "day");
  if (Math.abs(diffInDays) < 30) {
    return diffInDays < 0
      ? `${Math.abs(diffInDays)} day${
          Math.abs(diffInDays) !== 1 ? "s" : ""
        } ago`
      : `in ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`;
  }

  return target.format("MMMM D, YYYY");
}
