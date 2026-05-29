/**
 * Maps a case `status` (the raw DB value) to its translated label.
 *
 * Accepts the next-intl `t` function so it works in both server components
 * (`getTranslations`) and client components (`useTranslations`). Falls back to
 * the raw status string for any unmapped value.
 */
export function caseStatusLabel(
  t: (key: string) => string,
  status: string,
): string {
  const map: Record<string, string> = {
    active: 'CaseForm.statusActive',
    paused: 'CaseForm.statusPaused',
    completed: 'CaseForm.statusCompleted',
    archived: 'CaseForm.statusArchived',
  };
  return map[status] ? t(map[status]) : status;
}
