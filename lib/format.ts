/**
 * Number formatting helpers.
 *
 * The app is Arabic-first but uses Western (Latin) digits in both locales by
 * design — a fixed `en-US` numbering guarantees `0-9` with comma grouping
 * regardless of the active locale. Keeping the policy here means it can be
 * changed in one place if Arabic-Indic digits are ever wanted.
 */

export function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
