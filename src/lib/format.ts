/**
 * Format a Date or ISO string as a Philippines-style date.
 * Example: "August 24, 2026"
 */
export function formatDatePh(input: string | Date): string {
  return new Date(input).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a Date or ISO string as a Philippines-style date + time.
 * Example: "August 24, 2026, 3:42 PM"
 */
export function formatDateTimePh(input: string | Date): string {
  return new Date(input).toLocaleString("en-PH");
}
