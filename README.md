# ExpertNet Pakistan

Pakistan's MEP, HVAC, Commercial Kitchen & Technical Industry Network.
Powered by Standard Fabrication – Techno Engineering Services.

Full build spec: `ExpertNet_Pakistan_PRD.docx`. This repository is real,
database-backed source code — no mock screens, no static demo data paths.

## Verification note (read this first)

This codebase was built and reviewed in a sandboxed environment with **no
outbound network access** (confirmed: `npm install` fails with a `403
Forbidden` from the npm registry — not a rate limit, a hard network block).
Because of that:

- Every `.ts`/`.tsx` file in `src/` was checked with the TypeScript compiler
  directly (`tsc --noEmit`) and is syntactically and structurally clean.
- The smart-matching engine (`src/lib/matching.ts`) has real unit tests in
  `tests/matching.test.ts`, run with Node's built-in test runner — **7/7
  passing**, actually executed, not just written.
- `npm install` and `npm run build` could **not** be executed here and have
  **not** been verified end-to-end. Run them yourself (locally or in Claude
  Code, both of which have normal network access) before deploying. Given
  the dependency versions pinned in `package.json` (Next 14.2.5, React
  18.3.1, current as of this build), a clean install and build is expected,
  but you should treat that as the first thing to confirm, not an assumption.

## What is implemented (Phase 1 + Phase 2 + this round's additions)

- Full Supabase schema (25+ tables), RLS on every table, auth trigger
- Auth (signup/login), directory (companies/professionals — profile pages
  + create forms), Commercial Kitchen Marketplace (categories, products)
- Requirements + smart matching (tested scoring engine) + customer-controlled
  invite/contact/decline
- RFQ/Quotations (submit, award) · Lead Center · Admin Panel (dashboard,
  companies, verification queue)
- WhatsApp Business CRM: dashboard, Inbox (real Meta Cloud API send/receive),
  Contacts, Templates, Campaigns (opted-in-only, throttled dispatch)
- AI Technical Advisor (Anthropic API, preliminary-guidance disclaimer
  enforced in the system prompt)
- Subscriptions (plans + subscribe endpoint), Search (companies +
  professionals + products)
- **Analytics dashboard** — every figure (visitors, searches, profile views,
  WhatsApp/call clicks, requirements, leads, conversions, subscribers,
  revenue, top categories/cities) is a live query against
  `analytics_events`, `rfqs`, `requirements`, `leads`, `subscriptions`,
  `payments`. Click/view tracking is wired into the company profile page
  and a global page-view tracker.
- **Notifications** — API (list/mark-read) + a real header bell dropdown
  with unread count and polling
- **SEO** — `generateMetadata` on company/professional/product/category
  pages, dynamic `sitemap.xml` (`src/app/sitemap.ts`) built from live data,
  `robots.ts`
- **PWA** — manifest, hand-written service worker, and real generated
  icon-192.png / icon-512.png (navy/gold), registered in `layout.tsx`
  metadata for installability
- **Automated testing** — `npm run test` (Node's built-in test runner, zero
  extra dependencies), currently covering the matching engine

## Explicitly still pending — needs more build time or external services

These are genuinely out of scope for "fix bugs and verify" and need their
own implementation pass:

1. **Payment gateway** (JazzCash/EasyPaisa/Stripe) — subscriptions currently
   land in `pending_payment`; no real charge flow.
2. **File/image uploads** — logos, portfolios, product photos, verification
   docs are URL/text fields; no Supabase Storage buckets or upload UI yet.
3. **Edit/update screens** — companies/professionals/products support
   create + view, not edit, yet.
4. **Campaign creation UI + Segments builder UI** — the data model and
   send/dispatch logic are real; the "pick a template + define a segment"
   forms are not built (create via SQL/Supabase Studio for now).
5. **CSV/Excel & PDF import tools** (PRD Section 18).
6. **Automated test coverage beyond the matching engine** — API routes and
   UI components have no tests yet; only the pure scoring logic does.

## Requires your own external credentials before it will run at all

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — your Supabase project
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — your
  Meta App's WhatsApp Business Cloud API
- `ANTHROPIC_API_KEY` — for the AI Technical Advisor
- A payment provider account — once Pending item #1 above is built

## Setup

```bash
npm install
npm run test        # 7/7 matching-engine tests, no external services needed
cp .env.example .env.local
```

Run migrations, in order, in the Supabase SQL editor:
```
supabase/migrations/0001_init.sql
supabase/migrations/0002_seed.sql
supabase/migrations/0003_auth_trigger.sql
supabase/migrations/0004_phase2_additions.sql
```

```bash
npm run dev      # local development
npm run build    # production build — verify this in an environment with network access
npm run start
```

Register the WhatsApp webhook URL (`/api/whatsapp/webhook`) and verify token
in your Meta App dashboard.

## Next steps

Hand this repo + `ExpertNet_Pakistan_PRD.docx` + the two Pending lists above
to Claude Code: first `npm install && npm run build`, fix anything a real
dependency resolution surfaces, then work through payments, file uploads,
edit screens, campaign/segment builder UI, import tools, and broader test
coverage.
