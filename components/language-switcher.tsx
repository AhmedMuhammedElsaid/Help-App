'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
  startTransition(() => {
    router.replace(pathname, { locale: next });
  });
};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <Languages className="h-4 w-4 me-2" />
          {locale === 'ar' ? t('languageAr') : t('languageEn')}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchTo('en')}
          disabled={locale === 'en'}
        >
            {t('languageEn')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => switchTo('ar')}
          disabled={locale === 'ar'}
        >
           {t('languageAr')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
