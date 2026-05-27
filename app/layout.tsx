/**
 * Root layout is intentionally a pass-through.
 * The real <html>/<body> with the right `lang` and `dir` lives in
 * app/[locale]/layout.tsx so next-intl can flip it per locale.
 */
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
