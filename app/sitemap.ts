import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import type { LocalizedText } from '@/lib/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://help-app-ahmed-elsaid.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = routing.locales;

  // Static routes that actually exist in the app (just the homepage today).
  const staticEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  }));

  // Dynamic case detail pages — only public (active) cases.
  // `slug` is now JSONB ({ en, ar }) — see scripts/004.
  let cases: { slug: LocalizedText; updated_at: string | null }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('campaigns')
      .select('slug, updated_at')
      .eq('status', 'active');
    cases = data ?? [];
  } catch {
    // If Supabase is unreachable at build time, fall back to static entries only.
    cases = [];
  }

  const caseEntries: MetadataRoute.Sitemap = cases.flatMap((c) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/case/${c.slug[locale]}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );

  return [...staticEntries, ...caseEntries];
}
