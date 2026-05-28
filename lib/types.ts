/**
 * Domain types for the donation app.
 *
 * The database table is still named `campaigns` (from the original migration),
 * but throughout the UI we refer to them as "Cases" — the user-facing language
 * that matches a charity workflow better than "campaigns".
 */
export interface Case {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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
  payment_link: string | null;
}

export type CaseStatus = Case['status'];
