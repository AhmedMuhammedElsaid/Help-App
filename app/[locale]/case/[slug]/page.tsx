import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { getCaseBySlug } from '@/lib/cases';
import { localized } from '@/lib/localized';
import { buildDonateUrl } from '@/lib/whatsapp';
import { formatAmount, formatPercent } from '@/lib/format';
import { caseStatusLabel } from '@/lib/case-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JsonLd } from '@/components/json-ld';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://help-app-ahmed-elsaid.vercel.app';

type PageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = params;
  const normalizedSlug = decodeURIComponent(slug).trim();

  const result = await getCaseBySlug(normalizedSlug, locale);
  if (!result) return {};

  const { caseItem } = result;
  const localeKey = locale as 'en' | 'ar';
  const title = localized(caseItem.title, locale);
  const description = localized(caseItem.description, locale).slice(0, 160);
  const caseUrl = `${BASE_URL}/${locale}/case/${caseItem.slug[localeKey]}`;

  return {
    title,
    description,
    alternates: {
      canonical: caseUrl,
      languages: {
        en: `${BASE_URL}/en/case/${caseItem.slug.en}`,
        ar: `${BASE_URL}/ar/case/${caseItem.slug.ar}`,
        'x-default': `${BASE_URL}/ar/case/${caseItem.slug.ar}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      siteName: 'Help',
      title,
      description,
      url: caseUrl,
      images: [
        caseItem.image_url
          ? { url: caseItem.image_url, width: 1200, height: 630, alt: title }
          : { url: '/og-image.jpg', width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [caseItem.image_url ?? '/og-image.jpg'],
    },
  };
}

export default async function CasePage({ params }: PageProps) {
  const { locale, slug } = params;

  // IMPORTANT: must be first
  setRequestLocale(locale);

  const t = await getTranslations();

  // Normalize slug (fix Arabic encoding issues)
  const normalizedSlug = decodeURIComponent(slug).trim();

  const result = await getCaseBySlug(normalizedSlug, locale);

  // Safe notFound (prevents hydration crash)
  if (!result) {
    notFound();
  }

  const { caseItem, redirectSlug } = result;

  // The requested slug belongs to the other locale → redirect to the
  // localized URL so the page and its canonical/hreflang all agree.
  if (redirectSlug) {
    redirect({ href: `/case/${redirectSlug}`, locale });
  }

  const title = localized(caseItem.title, locale);
  const description = localized(caseItem.description, locale);

  const goal = Number(caseItem.goal_amount || 0);
  const current = Number(caseItem.current_amount || 0);

  const hasGoal = goal > 0;

  const percentage = hasGoal
    ? Math.min(100, (current / goal) * 100)
    : 0;

  const donateUrl = buildDonateUrl(
    t('Case.messagePrefix'),
    title,
    caseItem.payment_link ?? '',
  );

  const imageUrl = caseItem.image_url?.trim();

  const localeKey = locale as 'en' | 'ar';
  const caseUrl = `${BASE_URL}/${locale}/case/${caseItem.slug[localeKey]}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description: description.slice(0, 160),
        inLanguage: locale,
        datePublished: caseItem.created_at,
        dateModified: caseItem.updated_at,
        mainEntityOfPage: caseUrl,
        ...(imageUrl ? { image: imageUrl } : {}),
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('Common.home'),
            item: `${BASE_URL}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title,
            item: caseUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      {/* HERO */}
      <div className="relative border-b">
        <div className="relative h-[320px] md:h-[420px] overflow-hidden bg-muted">

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
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

                <Badge variant="outline">
                  {caseStatusLabel(t, caseItem.status)}
                </Badge>
              </div>

              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                {title}
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
                {description}
              </p>
            </article>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-sm space-y-4">

              {hasGoal && (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-2xl font-bold tracking-tight">
                      {formatAmount(current)} {caseItem.currency}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('Case.goal', {
                      goal: `${formatAmount(goal)} ${caseItem.currency}`,
                    })}
                  </p>

                  <Progress value={percentage} className="h-2.5" />

                  <p className="text-xs text-muted-foreground">
                    {t('Case.funded', { percent: formatPercent(percentage) })}
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
