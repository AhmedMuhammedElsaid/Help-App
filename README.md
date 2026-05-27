# Hope Charity — Donation App

A bilingual (Arabic + English) charity donation website. Visitors browse verified cases, click **Donate via WhatsApp**, and chat directly with the person handling that case. No payment integration — every donation conversation is human-to-human over WhatsApp.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS 4 + Supabase + next-intl + shadcn/ui**.

---

## Features

- Bilingual: English (`/en`) and Arabic (`/ar`) with full RTL support
- Public homepage with a grid of verified cases (thumbnail, title, description, optional goal progress)
- Per-case detail page with a prominent WhatsApp donate button
- Admin dashboard (Supabase email/password auth) — list, create, edit cases
- Each WhatsApp click opens a chat with a pre-filled message including the case title
- Mobile-first responsive design

---

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up env vars (see .env.local.example)
cp .env.local.example .env.local
# Then edit .env.local with your Supabase URL/key and WhatsApp number

# 3. Set up the database
#    Open the Supabase SQL Editor and run these in order:
#      scripts/001_create_campaigns_table.sql
#      scripts/002_simplify_for_donation_app.sql
#    Then in Supabase Auth → Users → Add user (with "Auto Confirm" checked)

# 4. Run dev server
pnpm dev
```

Open http://localhost:3000 — it redirects to `/en`. Try `/ar` for the Arabic UI. Visit `/en/admin` to log in and add your first case.

---

## Environment variables

| Variable | Example | What it's for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG…` | Supabase anon (public) key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `201017134627` | Charity's WhatsApp number (digits only, no `+`) |

See [.env.local.example](./.env.local.example) for the full template.

---

## Project structure (high level)

```
app/[locale]/        — All routes live here for i18n (en, ar)
  page.tsx           — Homepage (hero + cases grid)
  case/[slug]        — Public case detail
  admin/             — Dashboard + case CRUD
  auth/login         — Admin login
components/
  ui/                — shadcn primitives
  case-card.tsx      — Card with WhatsApp donate button
  case-form.tsx      — Admin create/edit form
  language-switcher.tsx
i18n/                — next-intl routing, navigation, request config
lib/
  supabase/          — Supabase clients (browser + server)
  whatsapp.ts        — Builds wa.me URLs
  types.ts           — Case type (DB table: `campaigns`)
messages/
  en.json, ar.json   — UI translations
scripts/             — SQL migrations
middleware.ts        — Combines next-intl routing + Supabase session refresh
```

A deep architectural reference (with conventions, gotchas, and common tasks) lives in [**APP_CONTEXT.md**](./APP_CONTEXT.md) — recommended reading before making any non-trivial change.

---

## Documentation

- 📖 **[APP_CONTEXT.md](./APP_CONTEXT.md)** — Full architecture reference. AI-friendly. Read this first.
- 🚀 **[deploy.md](./deploy.md)** — Step-by-step production deployment (Supabase + Vercel).

---

## Scripts

```bash
pnpm dev      # Start dev server with HMR
pnpm build    # Production build
pnpm start    # Run the production build
pnpm lint     # Next.js ESLint
```

---

## Adding a new language

1. Add the locale to `i18n/routing.ts` (e.g. `'ar'`)
2. Create `messages/ar.json` with the same keys as `en.json`
3. Add a dropdown item in `components/language-switcher.tsx`

That's it — routing, middleware, and per-locale layout pick it up automatically.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 (with logical properties for RTL) |
| UI | shadcn/ui + Radix primitives |
| i18n | next-intl 3.26 |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password) |
| Package manager | pnpm |

---

## License

MIT — do whatever you'd like.

---

Built with care. If you fork this for another charity, please keep the spirit: direct, human, no friction between donor and recipient.
