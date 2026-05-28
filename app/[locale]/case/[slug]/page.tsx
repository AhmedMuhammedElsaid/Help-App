import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { buildDonateUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

type PageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export default async function CasePage({ params }: PageProps) {
  const { locale, slug } = params;

  // IMPORTANT: must be first
  setRequestLocale(locale);

  const t = await getTranslations();

  const supabase = await createClient();

  // Normalize slug (fix Arabic encoding issues)
  const normalizedSlug = decodeURIComponent(slug).trim();

  const { data: caseItem, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', normalizedSlug)
    .maybeSingle();

  // Safe notFound (prevents hydration crash)
  if (error || !caseItem) {
    notFound();
  }

  const goal = Number(caseItem.goal_amount || 0);
  const current = Number(caseItem.current_amount || 0);

  const hasGoal = goal > 0;

  const percentage = hasGoal
    ? Math.min(100, (current / goal) * 100)
    : 0;

  const donateUrl = buildDonateUrl(
    t('Case.messagePrefix'),
    caseItem.title,
    caseItem.payment_link ?? '',
  );

  const imageUrl = caseItem.image_url?.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <div className="relative border-b">
        <div className="relative h-[320px] md:h-[420px] overflow-hidden bg-muted">

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={caseItem.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="absolute top-4 start-4">
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="gap-2 backdrop-blur-sm bg-background/80"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t('Common.back')}
              </Link>
            </Button>
          </div>
        </div>

        {/* TITLE */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-24 pb-8">
            <div className="rounded-xl border bg-card p-6 shadow-xl md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {t('Common.verified')}
                </Badge>

                <Badge variant="outline" className="capitalize">
                  {caseItem.status}
                </Badge>
              </div>

              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                {caseItem.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                {caseItem.description}
              </p>
            </article>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-sm space-y-4">

              {hasGoal && (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-2xl font-bold">
                      {current.toLocaleString()} {t("CaseForm.currency")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('Case.goal', {
                      goal: `${goal.toLocaleString()} ${t("CaseForm.currency")}`,
                    })}
                  </p>

                  <Progress value={percentage} className="h-2.5" />

                  <p className="text-xs text-muted-foreground">
                    {t('Case.funded', { percent: percentage.toFixed(0) })}
                  </p>
                </div>
              )}

              {/* DONATE BUTTON */}
              {donateUrl && (
                <Button
                  asChild
                  className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white"
                  size="lg"
                >
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="h-5 w-5" />
                    {t('Case.donateViaWhatsApp')}
                  </a>
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                {t('Case.shareCase')}
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* WHATSAPP ICON */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c..." />
    </svg>
  );
}
