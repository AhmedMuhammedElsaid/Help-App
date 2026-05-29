import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Case } from '@/lib/types';
import { formatAmount } from '@/lib/format';
import { AdminCaseList } from '@/components/admin-case-list';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Heart, TrendingUp, FolderOpen } from 'lucide-react';

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/auth/login', locale });
  }

  const { data: cases } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const list = (cases as Case[] | null) ?? [];
  const totalCases = list.length;
  const activeCases = list.filter((c) => c.status === 'active').length;
  const totalRaised = list.reduce((sum, c) => sum + Number(c.current_amount || 0), 0);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('Admin.dashboard')}</h1>
              <p className="text-muted-foreground">{t('Admin.dashboardSubtitle')}</p>
            </div>
            <Button asChild>
              <Link href="/admin/cases/new">
                <Plus className="me-2 h-4 w-4" />
                {t('Admin.newCase')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('Admin.totalCases')}
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('Admin.activeCases')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('Admin.totalRaised')}
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{formatAmount(totalRaised)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('Admin.yourCases')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminCaseList cases={list} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
