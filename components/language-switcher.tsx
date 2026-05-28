'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation'; // only router & pathname from here
import { Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
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
        <Button variant="ghost" onClick={() => locale === 'ar' ? switchTo("en") : switchTo("ar")} size="sm" disabled={isPending}>
          <Languages className="h-4 w-4 me-2" />
          {locale === 'en' ? t('languageAr') : t('languageEn')}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
