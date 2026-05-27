import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Case } from '@/lib/types';
import { CaseCard } from '@/components/case-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Heart, ArrowDown } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
              <Heart className="h-4 w-4 text-primary" fill="currentColor" />
              <span className="text-muted-foreground">{t('Common.tagline')}</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              {t('Home.heroTitle')}
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
              {t('Home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="gap-2 h-12 px-8">
                <Link href="/#cases">
                  <ArrowDown className="h-5 w-5" />
                  {t('Home.browseCases')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cases grid */}
      <section id="cases" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t('Home.casesHeading')}
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('Home.casesSubheading')}
            </p>
          </div>

          {cases && cases.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(cases as Case[]).map((c) => (
                <CaseCard key={c.id} caseItem={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-12 text-center bg-muted/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">{t('Home.noCases')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
