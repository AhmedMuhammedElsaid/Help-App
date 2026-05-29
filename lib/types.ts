/**
 * Domain types for the donation app.
 *
 * The database table is still named `campaigns` (from the original migration),
 * but throughout the UI we refer to them as "Cases" — the user-facing language
 * that matches a charity workflow better than "campaigns".
 */
/**
 * A piece of content stored in both supported locales.
 * Persisted as a JSONB column (`{ "en": "...", "ar": "..." }`) — see
 * `scripts/004_localize_case_content.sql`. Read it through `localized()`
 * in `lib/localized.ts` rather than indexing directly.
 */
export type LocalizedText = { en: string; ar: string };

export interface Case {
  id: string;
  title: LocalizedText;
  slug: LocalizedText;
  description: LocalizedText;
  goal_amount: number | null;
  current_amount: number;
  currency: string;
  image_url: string | null;
  organization_name: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  end_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  /** Stores either an Egyptian WhatsApp number (digits, without +2) or a direct payment URL. */
  payment_link: string | null;
}

export type CaseStatus = Case['status'];
