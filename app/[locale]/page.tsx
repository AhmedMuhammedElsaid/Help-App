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

  const trust = [
    { value: t('Home.trustReachesValue'), label: t('Home.trustReachesLabel') },
    { value: t('Home.trustVerifiedValue'), label: t('Home.trustVerifiedLabel') },
    { value: t('Home.trustDirectValue'), label: t('Home.trustDirectLabel') },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        {/* subtle backdrop wash */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* thin editorial rule */}
            <div className="mx-auto mb-7 h-[3px] w-10 rounded-full bg-primary" />
            <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
              {t('Home.heroTitle')}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t('Home.heroSubtitle')}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="h-12 gap-2 rounded-xl px-8 text-base">
                <Link href="/#cases">
                  <ArrowDown className="h-5 w-5" />
                  {t('Home.browseCases')}
                </Link>
              </Button>
            </div>

            {/* trust strip */}
            <div className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {trust.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center px-2 text-center"
                >
                  <span className="text-xl font-bold tracking-tight md:text-2xl">
                    {item.value}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground md:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cases grid */}
      <section id="cases" className="scroll-mt-16 bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t('Home.casesHeading')}
            </h2>
            <p className="mt-3 text-pretty text-lg text-muted-foreground">
              {t('Home.casesSubheading')}
            </p>
          </div>

          {cases && cases.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(cases as Case[]).map((c) => (
                <CaseCard key={c.id} caseItem={c} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed bg-background p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">{t('Home.noCases')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
