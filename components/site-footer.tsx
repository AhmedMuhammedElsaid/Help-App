import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Heart } from 'lucide-react';

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const social = [
    { label: t('Footer.linkedIn'), href: 'https://www.linkedin.com/in/ahmedmuhammedelsaid/' },
    { label: t('Footer.github'), href: 'https://github.com/AhmedMuhammedElsaid' },
    { label: t('Footer.portfolio'), href: 'https://ahmed-muhammed-elsaid.netlify.app' },
  ];

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Heart className="h-[1.15rem] w-[1.15rem]" fill="currentColor" />
              </span>
              <span>{t('Common.appName')}</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t('Footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('Footer.navigation')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('Header.home')}
                </Link>
              </li>
              <li>
                <Link href="/#cases" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t('Header.cases')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('Footer.contact')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="text-muted-foreground">
                {t('Footer.whats')}:{' '}
                <a
                  href="https://wa.me/201025533447"
                  className="font-medium text-primary transition-colors hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  01025533447
                </a>
              </li>
              <li className="text-muted-foreground">
                {t('Footer.whatsAlwaldan')}:{' '}
                <a
                  href="https://wa.me/201222395552"
                  className="font-medium text-primary transition-colors hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  01222395552
                </a>
              </li>
            </ul>
          </div>

          {/* Developer / social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('Footer.developedBy')}</h3>
            <a
              href="https://ahmed-muhammed-elsaid.netlify.app"
              className="block text-sm font-medium text-primary transition-colors hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Footer.developer')}
            </a>
            <ul className="space-y-2.5 text-sm">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {year} {t('Common.appName')}. {t('Footer.rights')}
        </div>
      </div>
    </footer>
  );
}
