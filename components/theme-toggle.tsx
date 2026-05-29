'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const t = useTranslations('Header');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('toggleTheme')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[1.15rem] w-[1.15rem]" />
        ) : (
          <Moon className="h-[1.15rem] w-[1.15rem]" />
        )
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem] opacity-0" />
      )}
    </Button>
  );
}
