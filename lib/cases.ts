import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Case } from '@/lib/types';

type LocaleKey = 'en' | 'ar';

export type CaseLookup = {
  caseItem: Case;
  /**
   * Set when the requested slug belongs to the *other* locale. The caller
   * should redirect to `/case/<redirectSlug>` so the URL matches the active
   * locale (this is what makes the language switcher work on case pages).
   */
  redirectSlug: string | null;
};

/**
 * Look up a case by a (possibly other-locale) slug.
 *
 * Wrapped in React `cache()` so the case detail page and its
 * `generateMetadata` share a single query per request.
 */
export const getCaseBySlug = cache(
  async (slug: string, locale: string): Promise<CaseLookup | null> => {
    const supabase = await createClient();

    // 1) Exact match in the active locale → render as-is.
    const current = await supabase
      .from('campaigns')
      .select('*')
      .eq(`slug->>${locale}`, slug)
      .maybeSingle();

    if (current.data) {
      return { caseItem: current.data as Case, redirectSlug: null };
    }

    // 2) Match the slug in the other locale → signal a redirect to the
    //    correct localized URL. Two sequential `.eq` calls avoid the quoting
    //    pitfalls of `.or()` with Arabic / spaced slug values.
    const other: LocaleKey = locale === 'ar' ? 'en' : 'ar';
    const alternate = await supabase
      .from('campaigns')
      .select('*')
      .eq(`slug->>${other}`, slug)
      .maybeSingle();

    if (alternate.data) {
      const found = alternate.data as Case;
      return { caseItem: found, redirectSlug: found.slug[locale as LocaleKey] };
    }

    return null;
  },
);
