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
| Fonts | Geist Sans + Geist Mono (`geist`) | latest |
| Analytics | `@vercel/analytics` | latest |
| Sitemap / robots | native `app/sitemap.ts` + `app/robots.ts` (dynamic) | — |
| Theming | `next-themes` (installed, **not wired up**) | ^0.4 |
| Package manager | pnpm | — |

> **Currency note**: although the DB column `currency` defaults to `'USD'`, the app is Egypt-focused. The case form writes `currency: t('CaseForm.currency')` which is **`"EGP"`** in both locales, and WhatsApp numbers get a hardcoded **`+2`** (Egypt) country-code prefix (see §6).

Tailwind 4 supports **logical CSS properties** (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) which auto-flip under `dir="rtl"`. **Use those instead of `ml-/mr-/pl-/pr-/left-/right-`** whenever horizontal direction is meaningful — otherwise the Arabic layout will break.

---

## 3. Directory map

```
donation-app/
├── app/
│   ├── globals.css                       # Tailwind + theme tokens (do not delete)
│   ├── layout.tsx                        # Pass-through root layout (returns {children})
│   ├── sitemap.ts                        # Dynamic sitemap: home + active /case/[slug] per locale (§12)
│   ├── robots.ts                         # Dynamic robots.txt (allows /, blocks admin+auth) (§12)
│   └── [locale]/                         # ALL routes live under here for i18n
│       ├── layout.tsx                    # <html lang dir>, full SEO generateMetadata + viewport,
│       │                                 #   Geist fonts, NextIntlClientProvider, header, footer (§12)
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
│   ├── case-form.tsx                     # Create/edit case form (client, uploads images to Supabase Storage)
│   ├── admin-case-list.tsx               # Admin list view of cases
│   └── theme-provider.tsx                # next-themes wrapper (installed but NOT mounted in layout)
├── i18n/
│   ├── routing.ts                        # Locales config: ['en', 'ar'], default 'ar'
│   ├── navigation.ts                     # Re-exports Link/redirect/useRouter from next-intl
│   └── request.ts                        # Loads messages JSON per request
├── hooks/                                # use-mobile.ts, use-toast.ts (also mirrored under components/ui)
├── lib/
│   ├── types.ts                          # Case type (maps to DB `campaigns` row); includes whatsapp_number
│   ├── whatsapp.ts                       # buildWhatsAppDonateUrl(prefix, title, whatsNum) — see §6
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
│   ├── 002_simplify_for_donation_app.sql # Our adjustments + storage bucket
│   └── 003_rename_payment_link_to_whatsapp_number.sql  # payment_link → whatsapp_number (run in Supabase)
├── styles/globals.css                    # Duplicate of app/globals.css (legacy; app/ one is active)
├── public/                               # Static assets: heart.png (favicon), og-image.jpg, site.webmanifest
│                                         #   (sitemap.xml + robots.txt are now served by app/sitemap.ts + app/robots.ts)
├── middleware.ts                         # Combines next-intl routing + Supabase session refresh
├── next.config.mjs                       # Wraps next config with next-intl plugin
├── components.json                       # shadcn config (don't edit unless adding new primitives)
├── tsconfig.json                         # Path alias `@/*` → repo root
├── .env.local.example                    # Template env file (commit this, NOT .env.local)
├── deploy.md                             # Production deployment notes (Vercel + Supabase)
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

Single table, defined across three SQL migrations (run all three in order in the Supabase SQL Editor).

```sql
public.campaigns (
  id             uuid PK
  title          jsonb NOT NULL                 -- { "en": "...", "ar": "..." } — see §7
  slug           jsonb NOT NULL                 -- { "en": "...", "ar": "..." } — per-locale unique indexes below
  description    jsonb NOT NULL                 -- { "en": "...", "ar": "..." }
  goal_amount    decimal(12,2)                  -- nullable (made optional in 002)
  current_amount decimal(12,2) DEFAULT 0
  currency       text DEFAULT 'USD'             -- could be 'EGP' for Egypt
  image_url      text                           -- public URL to thumbnail (now uploaded via UI)
  organization_name text                        -- nullable (made optional in 002)
  organization_logo text                        -- present in DB; NOT mapped on the `Case` TS type
  whatsapp_number text                          -- per-case WhatsApp number, Egyptian, without +2 (see §6)
  status         text DEFAULT 'active'          -- 'active' | 'paused' | 'completed' | 'archived'
  end_date       timestamptz
  created_at     timestamptz DEFAULT now()
  updated_at     timestamptz DEFAULT now()
  created_by     uuid REFERENCES auth.users(id)
)

-- Unique slugs enforced per locale (independent expression indexes):
-- campaigns_slug_en_key  ON (slug->>'en')
-- campaigns_slug_ar_key  ON (slug->>'ar')
```

> **`whatsapp_number` history**: this column was originally added directly in Supabase as `payment_link`, then renamed via `scripts/003_rename_payment_link_to_whatsapp_number.sql`. The `Case` TS type (`lib/types.ts`) still uses `payment_link: string | null` as the field name (legacy). You must add/rename this column in Supabase for the donate button to work — see §6.

> **`LocalizedText` type** (`lib/types.ts`): `title`, `slug`, and `description` are typed as `{ en: string; ar: string }`. Read them through `localized(value, locale)` in `lib/localized.ts` — never index directly in components. The DB stores these as native `jsonb` columns.

**Row Level Security policies** (all currently in the SQL files):

| Policy | Operation | Who | Condition |
|---|---|---|---|
| `campaigns_select_public` | SELECT | anyone (anon) | `status = 'active'` |
| `campaigns_select_admin` | SELECT | authenticated | `true` (sees all statuses) |
| `campaigns_insert_auth` | INSERT | authenticated | `created_by = auth.uid()` |
| `campaigns_update_own` | UPDATE | authenticated | `created_by = auth.uid()` |
| `campaigns_delete_own` | DELETE | authenticated | `created_by = auth.uid()` |

The **`case-thumbnails` storage bucket** (created in `002_*.sql`) is public-read, authenticated-write. **Image upload IS wired up**: `components/case-form.tsx` has a `<input type="file">` whose `uploadImage()` helper uploads to `case-thumbnails/campaigns/<uuid>.<ext>` and stores the returned public URL in `image_url`.

---

## 6. The WhatsApp donate flow (what makes this app unique)

There is **no payment processing**. The flow is:

1. Visitor clicks **"Donate"** on a case card or case detail page.
2. The button is an anchor (`<a href={donateUrl} target="_blank">`) hidden entirely when `donateUrl` is `null`.
3. URL is built by `buildDonateUrl(messagePrefix, caseTitle, paymentLink)` in `lib/whatsapp.ts`.
4. **Per-case only — no global fallback.** The 3rd arg is `caseItem.payment_link`. `buildDonateUrl` returns:
   - **`null`** if `payment_link` is empty → donate button is hidden.
   - **The value as-is** if it starts with `http/https` → direct payment link (e.g. InstaPay URL).
   - **`https://wa.me/2{number}?text=...`** otherwise → treated as an Egyptian phone number, `+2` prefixed, non-digits stripped.
5. The WhatsApp message prefix comes from `messages/*.json#Case.messagePrefix`; the case title is appended and `encodeURIComponent`-ed.

> ⚠️ The hardcoded `+2` prefix means non-Egypt phone numbers are not supported. To support other countries, store the full international number in `payment_link` and remove the prefix logic in `buildDonateUrl`.

**Footer contact numbers are separate and hardcoded** in `components/site-footer.tsx` (two Masjed Alwaldan numbers) — unrelated to `payment_link`.

---

## 7. i18n flow (next-intl)

**Routing**: `localePrefix: 'always'` — every URL is prefixed (`/en/...` or `/ar/...`). The **default locale is `ar`** (`i18n/routing.ts`), so the root `/` redirects to `/ar` via middleware. The SEO `x-default` alternate also points at `/ar`.

**Localized case slugs**: each case stores a separate slug per locale (e.g. `/en/case/ahmed-surgery`, `/ar/case/جراحة-أحمد`). The `slugify()` function in `components/case-form.tsx` uses `\p{L}\p{N}` Unicode classes and preserves Arabic characters natively — Arabic slugs are **not** transliterated to ASCII. The case detail route (`app/[locale]/case/[slug]/page.tsx`) uses `getCaseBySlug()` from `lib/cases.ts` which performs a self-heal: if the slug matches the *other* locale's value it returns a `redirectSlug` and the page issues a `redirect()` to the correct localized URL. This is what makes the language switcher work on case pages without any special handling — it just keeps the path and the redirect corrects the slug.

**Per-case SEO metadata**: `app/[locale]/case/[slug]/page.tsx` exports `generateMetadata` with a localized `canonical` and `hreflang` triplet (`en`/`ar`/`x-default`) pointing at each locale's own slug URL.

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

1. **SQL migration**: create `scripts/005_add_category.sql` with `alter table public.campaigns add column category text;`. Run in Supabase SQL Editor.
2. **Type**: add `category: string | null` to `Case` in `lib/types.ts`. If the field needs bilingual content, use `LocalizedText` instead of `string` and store it as `jsonb`.
3. **Form**: add an Input in `components/case-form.tsx`, include it in the `payload` object. For `LocalizedText` fields, follow the EN/AR `fieldset` pattern already used for title and description.
4. **Translations**: add `CaseForm.category` keys to both JSON files.
5. **Display**: read localized fields via `localized(caseItem.category, locale)` (see `lib/localized.ts`). Show on `case-card.tsx` and/or `app/[locale]/case/[slug]/page.tsx`.

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

### Change a case's WhatsApp number

Edit the case in the admin dashboard and update the **WhatsApp Number** field. There is no global number — each case must have its own. If a case has no number, the donate button is hidden on both the card and the detail page.

### Change the displayed currency

Cases store `currency` per-row. The SQL default is `'USD'`, **but the case form overwrites it on every save** with `currency: t('CaseForm.currency')`, which is `"EGP"` in both `messages/en.json` and `messages/ar.json`. So:

- To change the currency new/edited cases get, edit `CaseForm.currency` in **both** message files.
- To backfill existing rows: `update public.campaigns set currency = 'EGP' where currency = 'USD';`

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

8. **Image upload is wired up** (this was previously a TODO). The case form uploads the chosen file to the `case-thumbnails` bucket and stores the public URL. The `CaseForm.thumbnail` label text still says "URL" though — see §5.

9. **`whatsapp_number` (formerly `payment_link`) must be provisioned in Supabase.** It was added directly in the dashboard and renamed via `scripts/003`. Run that migration or the case form/donate button break — see §5 and §6.

10. **Sitemap & robots are dynamic** (`app/sitemap.ts` / `app/robots.ts`), not static files and not `next-sitemap`. See §12.

---

## 12. SEO, metadata & sitemaps

SEO was added after the initial bootstrap and is fairly extensive.

**Per-locale metadata** lives in `app/[locale]/layout.tsx` via `generateMetadata()`:
- `metadataBase` / canonical / `alternates.languages` come from **`NEXT_PUBLIC_SITE_URL`** (falls back to `https://help-app-ahmed-elsaid.vercel.app`). Set this env var per environment.
- Title uses a template `"%s | <appName>"`; `appName`/`tagline` come from the `Common` namespace in the message files.
- OpenGraph + Twitter cards point at `/og-image.jpg` (1200×630, in `public/`).
- Icons: full favicon set in `public/` — `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180×180). The `manifest` points at `/site.webmanifest`.
- `viewport` is exported separately (Next 14 requirement) and supports light/dark color scheme.

**`public/site.webmanifest`**: `name`/`short_name` set to `"Help"`, `description` filled, `start_url: "/"`, `android-chrome-192/512.png` icons, `display: standalone`.

**Structured data (JSON-LD)** is rendered via `components/json-ld.tsx` (a tiny server component using `dangerouslySetInnerHTML`):
- **Sitewide** (`app/[locale]/layout.tsx`): `@graph` with `Organization`+`NGO` (name, url, logo, description) and `WebSite` (name, url, inLanguage), linked by `@id`.
- **Per-case** (`app/[locale]/case/[slug]/page.tsx`): `@graph` with `Article` (headline, description, image, dates, publisher) and `BreadcrumbList` (Home → case). OG metadata on case pages uses `type: 'article'`, locale, siteName, explicit image dimensions, and falls back to `/og-image.jpg` when the case has no image. Twitter card mirrors OG.

**Sitemap & robots are dynamic, native Next.js metadata routes** (no `next-sitemap`, no static files in `public/`):
1. `app/sitemap.ts` — served at `/sitemap.xml`. Emits the homepage per locale **plus a `/[locale]/case/[slug]` entry for every *active* case**, fetched from Supabase (`from('campaigns').eq('status','active')`). Every entry includes `alternates.languages` with en/ar hreflang pairs (Google's recommended format). `lastModified` uses each case's `updated_at`. If Supabase is unreachable at build time it degrades to just the static (home) entries. Base URL comes from `NEXT_PUBLIC_SITE_URL`.
2. `app/robots.ts` — served at `/robots.txt`. Allows `/`, disallows the `admin` and `auth` paths for both locales, and points `Sitemap:` at `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

To add more static routes to the sitemap, extend the `staticEntries` array in `app/sitemap.ts` — and only with routes that actually exist.

---

## 13. What to read next

- `deploy.md` — production deployment (Vercel + Supabase)
- `README.md` — quick-start for human developers
- `scripts/001_create_campaigns_table.sql` + `scripts/002_simplify_for_donation_app.sql` + `scripts/004_localize_case_content.sql` — source of truth for the data model (run all three in order; `004` converts `title`/`slug`/`description` to `jsonb`)
- `lib/types.ts` — `Case` type and `LocalizedText`
- `lib/localized.ts` — `localized(value, locale)` helper; use this whenever reading `title`/`slug`/`description` from a `Case`
- `lib/cases.ts` — `getCaseBySlug()` with cross-locale self-heal; used by the case detail route
- `messages/en.json` — the canonical list of all UI strings
- `i18n/routing.ts` — single source of truth for supported locales
