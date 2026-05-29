'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Case } from '@/lib/types';
import { localized } from '@/lib/localized';
import { formatAmount } from '@/lib/format';
import { caseStatusLabel } from '@/lib/case-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pencil } from 'lucide-react';

interface AdminCaseListProps {
  cases: Case[];
}

export function AdminCaseList({ cases }: AdminCaseListProps) {
  const t = useTranslations();
  const locale = useLocale();

  if (cases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="mb-4 text-muted-foreground">{t('Admin.noCases')}</p>
        <Button asChild>
          <Link href="/admin/cases/new">{t('Admin.createFirst')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((c) => {
        const hasGoal = c.goal_amount && c.goal_amount > 0;
        const pct = hasGoal
          ? Math.min(100, (Number(c.current_amount) / Number(c.goal_amount)) * 100)
          : 0;

        return (
          <div
            key={c.id}
            className="flex flex-col gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
          >
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{localized(c.title, locale)}</h3>
                <Badge variant="secondary">
                  {caseStatusLabel(t, c.status)}
                </Badge>
              </div>
              {hasGoal && (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-semibold text-foreground">
                      {formatAmount(Number(c.current_amount))} {c.currency}
                    </span>
                    <span className="text-muted-foreground">
                      {t('Case.goal', {
                        goal: `${formatAmount(Number(c.goal_amount))} ${c.currency}`,
                      })}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/cases/${c.id}`}>
                <Pencil className="me-2 h-4 w-4" />
                {t('Common.edit')}
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
