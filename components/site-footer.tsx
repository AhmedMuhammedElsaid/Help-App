import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Heart } from 'lucide-react';

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span>{t('Common.appName')}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('Footer.tagline')}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t('Footer.navigation')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  {t('Header.home')}
                </Link>
              </li>
              <li>
                <Link href="/#cases" className="text-muted-foreground hover:text-foreground">
                  {t('Header.cases')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t('Footer.contact')}</h3>
            <p className="text-sm text-muted-foreground">
              {t("Footer.whats")}:{' '}
              <a
                href={`https://wa.me/${('+201025533447').replace(/[^0-9]/g, '')}`}
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                01025533447
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Footer.whatsAlwaldan")}:{' '}
              <a
                href={`https://wa.me/${('+201222395552').replace(/[^0-9]/g, '')}`}
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
              01222395552
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t("Footer.developedBy")}:              <a
              href='https://ahmed-muhammed-elsaid.netlify.app'
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Footer.developer')}
            </a></h3>

            <a
              href='https://www.linkedin.com/in/ahmedmuhammedelsaid/'
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Footer.linkedIn')}
            </a>

            <a
              href='https://ahmed-muhammed-elsaid.netlify.app'
              className="font-medium text-primary hover:underline mx-5"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Footer.portfolio')}
            </a>

            <a
              href='https://github.com/AhmedMuhammedElsaid'
              className="font-medium text-primary hover:underline "
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Footer.github')}
            </a>

          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {year} {t('Common.appName')}. {t('Footer.rights')}
        </div>
      </div>
    </footer>
  );
}
