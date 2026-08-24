/**
 * Format a number as Philippine Peso currency.
 * Example: 1250 -> "₱1,250.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

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
