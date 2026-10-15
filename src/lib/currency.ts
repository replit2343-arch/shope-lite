/**
 * Ringgit Malaysia (RM) currency formatter and utilities
 */

export const DEFAULT_PRODUCT_PRICE = 59.0;
export const SHIPPING_REGULAR_RM = 6.0;
export const SHIPPING_INSTANT_RM = 15.0;

/**
 * Normalizes any legacy Rupiah amounts (e.g. 199000) to reasonable RM amounts
 */
export function normalizePriceRM(val: number | string | undefined | null): number {
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  if (!num || isNaN(num) || num <= 0) return DEFAULT_PRODUCT_PRICE;
  // If value was stored in old Rupiah (e.g. 199000), scale it down
  if (num >= 10000) {
    if (num === 199000) return 59.0;
    if (num === 30000) return 15.0;
    if (num === 15000) return 6.0;
    if (num === 10000) return 5.0;
    return Math.round((num / 3300) * 100) / 100;
  }
  return num;
}

/**
 * Formats a number to Malaysian Ringgit (RM) display string, e.g. RM 59.00
 */
export function formatRM(amount: number | string | undefined | null): string {
  const normalized = normalizePriceRM(amount);
  return `RM ${normalized.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
