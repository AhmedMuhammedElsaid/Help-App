'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation'; // only router & pathname from here
import { useSearchParams } from 'next/navigation';          // search params from next/navigation
import { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    // Fallback to '/' if pathname is null (initial render edge case)
    const currentPath = pathname ?? '/';

    // Preserve query string, if any
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${currentPath}?${queryString}` : currentPath;

    startTransition(() => {
      router.replace(fullPath, { locale: next });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" onClick={() => locale === 'ar' ? switchTo("en") : switchTo("ar")} size="sm" disabled={isPending}>
          <Languages className="h-4 w-4 me-2" />
          {locale === 'en' ? t('languageAr') : t('languageEn')}
        </Button>
      </DropdownMenuTrigger>
      {/* <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchTo('en')}
          // disabled={locale === 'en'}
        >
          {t('languageEn')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => switchTo('ar')}
          // disabled={locale === 'ar'}
        >
          {t('languageAr')}
        </DropdownMenuItem>
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
}
