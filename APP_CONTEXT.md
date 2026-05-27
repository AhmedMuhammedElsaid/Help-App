# APP_CONTEXT.md

> **Purpose**: A self-contained context dump for any AI assistant (or developer) opening this repo cold. Read this file first before making changes. It explains the *what*, the *why*, the *where*, and the non-obvious gotchas.

---

## 1. What this app is

A bilingual (Arabic + English) charity donation website for a single charity organization. Visitors browse "cases" (people / situations needing help) on the homepage. Each case has a **"Donate via WhatsApp"** button that opens a WhatsApp chat with the charity's number, pre-filled with the case title — so the donor can talk directly with the person handling that case.

There is **no payment integration** (no Stripe / PayPal / etc.). All donations are handled human-to-human via WhatsApp.

A simple **admin dashboard** at `/[locale]/admin` lets logged-in admins create / edit / delete cases (title, slug, description, thumbnail URL, optional goal amount, status).

The codebase was bootstrapped from [`srddevj/givehope-donation-portal`](https://github.com/srddevj/givehope-donation-portal) and then heavily stripped down: all payment providers, kiosk mode, donor accounts, recurring subscriptions, marketing fluff, and fake testimonials were removed.

---

## 2. Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.16 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4.1.9 |
| UI primitives | shadcn/ui (Radix + CVA) | — |
| Icons | lucide-react | ^0.454 |
| i18n | next-intl | ^3.26.5 |
| Database | Supabase (Postgres) | latest |
| Auth | Supabase Auth (email/password) | — |
| Forms | react-hook-form + zod | ^7.60 / ^3.25 |
| Package manager | pnpm | — |

Tailwind 4 supports **logical CSS properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) which auto-flip under `dir="rtl"`. **Use those instead of `ml-/mr-/pl-/pr-/left-/right-`** whenever horizontal direction is meaningful — otherwise the Arabic layout will break.

---

## 3. Directory map

```
donation-app/
├── app/
│   ├── globals.css                       # Tailwind + theme tokens (do not delete)
│   ├── layout.tsx                        # Pass-through root layout (returns {children})
│   └── [locale]/                         # ALL routes live under here for i18n
│       ├── layout.tsx                    # <html lang dir>, NextIntlClientProvider, header, footer
│       ├── page.tsx                      # Homepage (hero + cases grid)
│       ├── case/[slug]/page.tsx          # Public case detail page
│       ├── auth/login/page.tsx           # Admin login (Supabase email/password)
│       └── admin/
│           ├── page.tsx                  # Dashboard: stats + cases list
│           └── cases/
│               ├── new/page.tsx          # Create new case
│               └── [id]/page.tsx         # Edit existing case
├── components/
│   ├── ui/                               # shadcn primitives — DO NOT EDIT, just import
│   ├── site-header.tsx                   # Top nav, includes <LanguageSwitcher />
│   ├── site-footer.tsx                   # Footer (server component with useTranslations)
│   ├── language-switcher.tsx             # Client component, uses i18n router.replace()
│   ├── case-card.tsx                     # Case card on grid (WhatsApp + Learn More buttons)
│   ├── case-form.tsx                     # Create/edit case form (client, calls Supabase)
│   ├── admin-case-list.tsx               # Admin list view of cases
│   └── theme-provider.tsx                # next-themes wrapper (unused currently)
├── i18n/
│   ├── routing.ts                        # Locales config: ['en', 'ar'], default 'en'
│   ├── navigation.ts                     # Re-exports Link/redirect/useRouter from next-intl
│   └── request.ts                        # Loads messages JSON per request
├── lib/
│   ├── types.ts                          # Case type (maps to DB `campaigns` row)
│   ├── whatsapp.ts                       # buildWhatsAppDonateUrl(prefix, title)
│   ├── utils.ts                          # cn() classname helper (do not delete)
│   └── supabase/
│       ├── client.ts                     # Browser Supabase client
│       ├── server.ts                     # Server-side Supabase client
│       └── middleware.ts                 # Legacy helper, not used by new middleware.ts
├── messages/
│   ├── en.json                           # English translations (source of truth)
│   └── ar.json                           # Arabic translations (Modern Standard Arabic)
├── scripts/
│   ├── 001_create_campaigns_table.sql    # Original schema (do not modify)
│   └── 002_simplify_for_donation_app.sql # Our adjustments + storage bucket
├── public/                               # Static assets (placeholder images, favicon)
├── middleware.ts                         # Combines next-intl routing + Supabase session refresh
├── next.config.mjs                       # Wraps next config with next-intl plugin
├── components.json                       # shadcn config (don't edit unless adding new primitives)
├── tsconfig.json                         # Path alias `@/*` → repo root
├── .env.local.example                    # Template env file (commit this, NOT .env.local)
└── package.json
```

---

## 4. Critical naming convention: "Case" vs "campaigns"

The **database table is named `campaigns`** (inherited from the original GiveHope schema in `scripts/001_*.sql`). We never renamed it because: (a) renaming a table in Supabase requires migrating data and RLS policies, and (b) the column names already make sense.

**In all TypeScript / UI code, the entity is called a `Case`.** The TS type in `lib/types.ts` is `Case`, components are `case-card.tsx` / `case-form.tsx` / `admin-case-list.tsx`, routes are `/case/[slug]` and `/admin/cases/*`, translation namespace is `Case` / `CaseForm`.

**When querying Supabase, always use `from('campaigns')`.** When manipulating data in TS, type it as `Case`. Example:

```ts
const { data } = await supabase
  .from('campaigns')                   // ← DB table name
  .select('*')
  .order('created_at', { ascending: false });

const cases = (data as Case[] | null) ?? [];  // ← TS type
```

Do **not** rename the table or the type unless you're prepared to update both sides simultaneously.

---

## 5. Data model

Single table, defined across two SQL migrations.

```sql
public.campaigns (
  id             uuid PK
  title          text NOT NULL                  -- aka "header" in UI
  slug           text UNIQUE NOT NULL           -- used in /case/[slug] URL
  description    text
  goal_amount    decimal(12,2)                  -- nullable (made optional in 002)
  current_amount decimal(12,2) DEFAULT 0
  currency       text DEFAULT 'USD'             -- could be 'EGP' for Egypt
  image_url      text                           -- public URL to thumbnail
  organization_name text                        -- nullable (made optional in 002)
  organization_logo text
  status         text DEFAULT 'active'          -- 'active' | 'paused' | 'completed' | 'archived'
  end_date       timestamptz
  created_at     timestamptz DEFAULT now()
  updated_at     timestamptz DEFAULT now()
  created_by     uuid REFERENCES auth.users(id)
)
```

**Row Level Security policies** (all currently in the SQL files):

| Policy | Operation | Who | Condition |
|---|---|---|---|
| `campaigns_select_public` | SELECT | anyone (anon) | `status = 'active'` |
| `campaigns_select_admin` | SELECT | authenticated | `true` (sees all statuses) |
| `campaigns_insert_auth` | INSERT | authenticated | `created_by = auth.uid()` |
| `campaigns_update_own` | UPDATE | authenticated | `created_by = auth.uid()` |
| `campaigns_delete_own` | DELETE | authenticated | `created_by = auth.uid()` |

The **`case-thumbnails` storage bucket** (created in `002_*.sql`) is public-read, authenticated-write. Currently the case form takes an image **URL** as input — uploading directly to the bucket is not wired up in the UI yet. If you add file upload, use `supabase.storage.from('case-thumbnails').upload(...)`.

---

## 6. The WhatsApp donate flow (what makes this app unique)

There is **no payment processing**. The flow is:

1. Visitor clicks **"Donate via WhatsApp"** on a case card or case detail page.
2. The button is an anchor (`<a href={whatsappUrl} target="_blank">`) pointing at `https://wa.me/<NUMBER>?text=<MESSAGE>`.
3. URL is built by `buildWhatsAppDonateUrl(messagePrefix, caseTitle)` in `lib/whatsapp.ts`.
4. The phone number comes from **`NEXT_PUBLIC_WHATSAPP_NUMBER`** env var — international format, no `+`, digits only (e.g. `201017134627`).
5. The message prefix is translated: `messages/en.json#Case.messagePrefix` ("Hello, I would like to donate to:") or the Arabic equivalent.
6. The case title is appended verbatim and the whole string is `encodeURIComponent`-ed.

Result for a case titled "Help Ahmed with chemo" on English locale:
```
https://wa.me/201017134627?text=Hello%2C%20I%20would%20like%20to%20donate%20to%3A%20Help%20Ahmed%20with%20chemo
```

**One global number** — there is no per-case phone number. If you ever need per-case numbers, add a `whatsapp_number` column to the table and override `buildWhatsAppDonateUrl` to accept an optional number.

---

## 7. i18n flow (next-intl)

**Routing**: `localePrefix: 'always'` — every URL is prefixed (`/en/...` or `/ar/...`). The root `/` redirects to `/en` via middleware.

**Adding a translation key**:
1. Add it to both `messages/en.json` AND `messages/ar.json` (same path).
2. In a **server component**: `const t = await getTranslations(); t('Namespace.key')`.
3. In a **client component**: `const t = useTranslations(); t('Namespace.key')` — and the component must be inside `<NextIntlClientProvider>` (it is, via the locale layout).
4. For interpolation: `t('Case.goal', { goal: '5000 USD' })` matches `"of {goal} goal"` in JSON.

**Linking between pages**: ALWAYS import `Link` and `useRouter` from `@/i18n/navigation`, NOT from `next/link` or `next/navigation`. The i18n versions preserve the active locale. Same goes for `redirect`.

```tsx
import { Link, useRouter, redirect } from '@/i18n/navigation';
```

**RTL flip**: The `<html dir>` attribute is set in `app/[locale]/layout.tsx` based on the locale (`ar` → `rtl`, anything else → `ltr`). Tailwind logical properties handle the rest *as long as you use `ms-*` / `me-*` etc.* (see §2).

**Adding a new locale** (e.g. French):
1. Add `'fr'` to `locales` in `i18n/routing.ts`.
2. Create `messages/fr.json` with the same keys.
3. Translate UI strings in `language-switcher.tsx` (add a third dropdown item).
4. Done — middleware and per-locale routing auto-pick it up.

---

## 8. Auth flow

Admin-only. Public visitors never log in.

1. `/[locale]/auth/login` → `signInWithPassword` via `lib/supabase/client.ts`.
2. On success, redirects to `/[locale]/admin` via the i18n router.
3. `middleware.ts` calls `supabase.auth.getUser()` on every request, which refreshes the session cookie.
4. Admin pages (`/admin`, `/admin/cases/new`, `/admin/cases/[id]`) check `supabase.auth.getUser()` server-side; if no user, they call `redirect({ href: '/auth/login', locale })`.

**Creating an admin account**: There is no signup page (intentional). Create users via the Supabase dashboard → Authentication → Users → "Add user" → enter email + password.

**There is no role system** — anyone with a Supabase account can log in and manage cases. If multi-role admin (e.g. moderators) becomes a need, add a `roles` table and gate routes accordingly.

---

## 9. The middleware composition (subtle but important)

`middleware.ts` combines two responsibilities that both need cookies:

```ts
export async function middleware(request: NextRequest) {
  // 1) next-intl decides if we need to redirect to /<locale>/...
  const response = handleI18nRouting(request);

  // 2) Supabase refreshes auth cookies onto that same response
  const supabase = createServerClient(..., {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(toSet) {
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}
```

The key trick: we let next-intl create the response, then **write Supabase cookies onto it** — that way locale redirects don't drop the auth session. If you rewrite this, preserve that ordering or auth will silently break after locale switches.

The `matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']` skips API routes and static assets.

---

## 10. Common tasks (cheat sheet)

### Add a new field to a case (e.g. `category`)

1. **SQL migration**: create `scripts/003_add_category.sql` with `alter table public.campaigns add column category text;`. Run in Supabase SQL Editor.
2. **Type**: add `category: string | null` to `Case` in `lib/types.ts`.
3. **Form**: add an Input in `components/case-form.tsx`, include it in the `payload` object.
4. **Translations**: add `CaseForm.category` keys to both JSON files.
5. **Display**: show it on `case-card.tsx` and/or `app/[locale]/case/[slug]/page.tsx`.

### Add a new page

1. Create the route under `app/[locale]/your-route/page.tsx`.
2. In a server component, call `setRequestLocale(locale)` at the top so static rendering knows the locale.
3. Use `await getTranslations()` for server-side translations.
4. Add any new translation keys to both `messages/*.json`.

### Add a new shadcn primitive

```bash
pnpm dlx shadcn@latest add <component-name>
```
Files land in `components/ui/`. Do not hand-edit those — re-run the CLI to update.

### Change the WhatsApp number

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` (dev) and in your hosting platform's env vars (prod). Restart the dev server / redeploy.

### Switch currency from USD to EGP

Cases store `currency` per-row (default `'USD'` from the SQL). To change globally:

```sql
alter table public.campaigns alter column currency set default 'EGP';
update public.campaigns set currency = 'EGP' where currency = 'USD';
```

The UI shows whatever `caseItem.currency` says — no formatting code change needed.

---

## 11. Known gotchas

1. **`pnpm-lock.yaml` may be stale** after the original clone because we removed `stripe`, `square`, `crypto`, and added `next-intl`. If `pnpm install` complains, delete `node_modules` and `pnpm-lock.yaml`, then re-install.

2. **`next.config.mjs` has `typescript.ignoreBuildErrors: true`** inherited from the v0.dev original. This means `pnpm build` will *not* catch type errors. Run `pnpm exec tsc --noEmit` separately if you want type safety in CI.

3. **The middleware matcher excludes anything with a `.`** in the path — this is why we matter for asset paths. Don't put dynamic routes with literal dots in URLs.

4. **`app/layout.tsx` is intentionally a pass-through** that returns `children`. The real `<html>` lives in `app/[locale]/layout.tsx` so `lang` and `dir` can change per locale. Next.js will print a warning in dev about a missing root `<html>` — it's safe to ignore as long as every route is under `[locale]`.

5. **shadcn `Select` doesn't play perfectly with RTL** — popover positioning can be off. If you hit issues, the workaround is to add `dir="rtl"` explicitly on the `<SelectContent>` when locale is `ar`.

6. **The `created_by` filter on the dashboard was removed** — the admin sees ALL cases regardless of who created them (single-charity model). If you re-introduce multi-tenant, restore the `eq('created_by', user.id)` filter in `app/[locale]/admin/page.tsx`.

7. **There's a `lib/supabase/middleware.ts` file** with a legacy `updateSession` helper that the new `middleware.ts` doesn't use. Safe to delete if you're tidying up, but harmless if left.

8. **No image upload UI** — the case form takes a URL. Wire it up to the `case-thumbnails` Supabase Storage bucket if you want native upload (bucket already exists, RLS already set).

---

## 12. What to read next

- `deploy.md` — production deployment (Vercel + Supabase)
- `README.md` — quick-start for human developers
- `scripts/001_create_campaigns_table.sql` + `scripts/002_simplify_for_donation_app.sql` — source of truth for the data model
- `messages/en.json` — the canonical list of all UI strings
- `i18n/routing.ts` — single source of truth for supported locales
