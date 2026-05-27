import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Case } from '@/lib/types';
import { CaseForm } from '@/components/case-form';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditCasePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/auth/login', locale });
  }

  const { data: caseItem } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <CaseForm userId={user!.id} initialCase={caseItem as Case} />
    </div>
  );
}
