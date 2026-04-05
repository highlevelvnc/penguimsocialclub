# Penguin Social Club — MVP

Cannabis social club management platform. Single-tenant MVP for Penguin Social Club, Barcelona.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (PostgreSQL + Auth)
- Deployed to Vercel

## Project Structure
```
src/
  app/[locale]/          Routes with locale prefix (es/en/pt)
    login/               Admin login (Supabase Auth)
    pos/                 POS counter interface
      lock/              PIN entry for attendants
    admin/               Admin panel (members, products, staff, close)
  actions/               Server Actions (all mutations)
  components/
    pos/                 POS-specific components
    admin/               Admin-specific components
    ui/                  shadcn/ui components
  lib/
    supabase/            Supabase clients (client, server, admin) + types
    i18n/                Translation system (JSON locales + provider)
    pos/                 POS business logic (cart, limits)
    constants.ts         Category maps, shop ID
    session.ts           iron-session PIN auth
supabase/
  migrations/            SQL schema + functions
  seed/                  Seed data
```

## Key Conventions
- All mutations go through Server Actions in `src/actions/`
- Checkout uses `execute_checkout` PostgreSQL function (atomic)
- Categories are code constants (7 fixed), subcategories are DB-driven
- i18n: all UI text via translation keys, never hardcoded strings
- Products use snake_case internal keys, display via locale files
- `shop_id` on every business table (future multi-tenant)

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npx tsc --noEmit     # Type check
```

## Auth
- Admin: Supabase Auth (email + password) -> accesses /admin + /pos
- Attendant: PIN (4-6 digits, bcrypt hashed) -> accesses /pos only
- PIN session stored in encrypted iron-session cookie

## Database
- Schema: `supabase/migrations/001_schema.sql`
- Functions: `supabase/migrations/002_functions.sql`
- Seed: `supabase/seed/001_seed.sql`
- Run migrations via Supabase dashboard SQL editor or CLI

## Environment
Copy `.env.local.example` to `.env.local` and fill in Supabase credentials.
