import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  setRequestLocale,
  getTranslations,
} from 'next-intl/server';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

// @ts-expect-error CSS imports are handled by Next.js
import '../globals.css';

const SITE_URL = 'https://help-app-ahmed-elsaid.vercel.app/ar';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: 'Common',
  });

  const title = t('appName');
  const description = t('tagline');

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: title,
      template: `%s | ${title}`,
    },

    description,

    applicationName: title,

    keywords: [
      'donation',
      'charity',
      'islamic donations',
      'help',
      'fundraising',
      'zakat',
      'sadaqah',
    ],

    authors: [
      {
        name: 'Ahmed Muhammed Elsaid',
      },
    ],

    creator: 'Ahmed Muhammed Elsaid',
    publisher: 'https://ahmed-muhammed-elsaid.netlify.app/',

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },

    icons: {
      icon: [
        {
          url: '/heart.png',
          type: 'image/png',
        },
      ],
      shortcut: ['/heart.png'],
      apple: [
        {
          url: '/heart.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },

    openGraph: {
      type: 'website',
      locale,
      url: SITE_URL,
      siteName: title,
      title,
      description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/heart.png'],
    },

    category: 'charity',
  };
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (
    !routing.locales.includes(
      locale as (typeof routing.locales)[number]
    )
  ) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen flex flex-col font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
