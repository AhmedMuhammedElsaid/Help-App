"use client";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Case } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { buildWhatsAppDonateUrl } from '@/lib/whatsapp';
import { Heart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
interface CaseCardProps {
  caseItem: Case;
}

export function CaseCard({ caseItem }: CaseCardProps) {
  const t = useTranslations();

  const hasGoal = caseItem.goal_amount && caseItem.goal_amount > 0;
  const percentage = hasGoal
    ? Math.min(100, (Number(caseItem.current_amount) / Number(caseItem.goal_amount)) * 100)
    : 0;

    const router = useRouter();

const goToCase = () => {
  router.push(`/case/${caseItem.slug}`);
};

  const whatsappUrl = buildWhatsAppDonateUrl(
    t('Case.messagePrefix'),
    caseItem.title,
    caseItem.payment_link ?? ''
  );

  return (
    <Card   onClick={goToCase}
 className="group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:border-primary/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {caseItem.image_url ? (
          <Image
            src={caseItem.image_url}
            alt={caseItem.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Heart className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
          <ShieldCheck className="h-3 w-3" />
          {t('Common.verified')}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-balance text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {caseItem.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground leading-relaxed flex-1">
          {caseItem.description}
        </p>

        {hasGoal && (
          <div className="space-y-2 mt-auto">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-foreground">
                {Number(caseItem.current_amount).toLocaleString()} {caseItem.currency}
              </span>
              <span className="text-muted-foreground">
                {t('Case.goal', {
                  goal: `${Number(caseItem.goal_amount).toLocaleString()} ${caseItem.currency}`,
                })}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {t('Case.funded', { percent: percentage.toFixed(0) })}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        <Button asChild className="flex-1 gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-4 w-4" />
            {t('Case.donateViaWhatsApp')}
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/case/${caseItem.slug}`}>{t('Common.learnMore')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
