import type { LocalizedText } from './types';

/**
 * Read a localized content field for the active locale.
 *
 * Falls back to the default locale (`ar`) and then `en` so a partially
 * filled record never renders blank. The `string` guard tolerates legacy /
 * un-migrated rows that still hold a plain string instead of `{ en, ar }`.
 */
export function localized(
  value: LocalizedText | string | null | undefined,
  locale: string,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale as keyof LocalizedText] || value.ar || value.en || '';
}
