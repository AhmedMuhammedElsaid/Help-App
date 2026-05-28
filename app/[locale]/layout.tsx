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

import '../globals.css';

// Base URL without locale – read from env for production
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://help-app-ahmed-elsaid.vercel.app';

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

  // Full canonical URL for this locale
  const canonicalUrl = `${BASE_URL}/${locale}`;

  return {
    metadataBase: new URL(BASE_URL),

    title: {
      default: title,
      template: `%s | ${title}`,
    },

    description,

    applicationName: title,
    appleWebApp: {
      capable: true,
      title: title,
      statusBarStyle: 'black-translucent',
    },

    formatDetection: {
      telephone: false, // set to true if you want phone numbers to be links
    },

    keywords: [
      'donation platform',
      'charity donations',
      'islamic charity',
      'zakat donations',
      'sadaqah platform',
      'medical fundraising',
      'help people in need',
      'donation website',
      'online charity platform',
      'تبرعات',
      'صدقة',
      'زكاة',
      'جمع تبرعات',
    ],

    authors: [
      {
        name: 'Ahmed Muhammed Elsaid',
        url: 'https://ahmed-muhammed-elsaid.netlify.app',
      },
    ],

    creator: 'Ahmed Muhammed Elsaid',
    publisher: 'Ahmed Muhammed Elsaid',

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
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/en`,
        ar: `${BASE_URL}/ar`,
        'x-default': `${BASE_URL}/ar`, // fallback locale
      },
    },

    icons: {
      icon: [{ url: '/heart.png', type: 'image/png' }],
      shortcut: ['/heart.png'],
      apple: [{ url: '/heart.png' }],
    },

    manifest: '/site.webmanifest',

    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      url: canonicalUrl,
      siteName: title,
      title: title,
      description: description,
      images: [
        {
          url: '/og-image.jpg', // will be absolute via metadataBase
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/og-image.jpg'], // use a 1200x600 image, not heart.png
      site: '@yourhandle', // optional: add your Twitter handle
    },

    category: 'charity',
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        {/* Additional SEO meta can be added here if needed */}
      </head>
      <body
        className={`min-h-screen flex flex-col font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
