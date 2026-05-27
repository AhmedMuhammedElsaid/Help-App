import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { CaseForm } from '@/components/case-form';

export default async function NewCasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/auth/login', locale });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <CaseForm userId={user!.id} />
    </div>
  );
}
