/** Format integer cents as a currency string, e.g. 1250 -> "$12.50". */
export function formatMoney(cents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Format cents without the currency symbol, e.g. 1250 -> "12.50". */
export function formatAmount(cents: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Parse a user-entered decimal string (e.g. "12.50") into integer cents. */
export function parseMoneyToCents(input: string): number | null {
  const trimmed = input.trim().replace(/[$,]/g, '');
  if (trimmed === '' || !/^\d*\.?\d{0,2}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (Number.isNaN(value)) return null;
  return Math.round(value * 100);
}
