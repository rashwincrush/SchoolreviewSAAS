# School Reviews SaaS

A PNPM monorepo with two Vite + React apps (embed, admin), shared UI, shared lib, and Supabase functions scaffolding.

## Structure

```
school-reviews-saas/
  apps/
    embed/
    admin/
  packages/
    ui/
    lib/
  supabase/
    functions/
      reviews-public/
      reviews-submit/
      reviews-moderate/
      domains-guard/
    migrations/
```

## What is this project?

School Reviews SaaS is a multi-tenant platform that lets schools collect, moderate, and publish reviews on their own websites.

- Embeddable review widget for school sites (in `apps/embed/`)
- Admin panel for tenant setup and moderation (in `apps/admin/`)
- Supabase for auth, database (RLS), and Edge Functions (`supabase/functions/`)
- Lightweight embed loader (`tools/embed-loader/embed.js`) that injects an iframe

## Why was it created?

- To help schools showcase authentic feedback while protecting brand reputation
- To ensure reviewers are real (Google OAuth) and reduce spam
- To enable moderation before publishing
- To improve SEO with JSON-LD rich snippets (aggregate ratings)
- To support agencies/districts managing multiple schools (multi-tenant)

## Who uses it?

- School admins/marketing teams: configure a tenant, allow domains, approve/reject reviews
- Reviewers (parents, students, alumni): sign in and submit reviews through the widget
- Agencies/operators: manage multiple schools from one system

## Key features

- Multi-tenant with strict data isolation (Postgres RLS)
- Google OAuth sign-in for reviewers
- Moderation workflow (pending → approved/rejected)
- Public reviews/summary API via Supabase Edge Functions
- Domain guard to prevent unauthorized embedding
- JSON-LD for SEO rich results

## Example use case

St. Mark’s School wants to promote authentic parent reviews:

1. Admin creates a tenant with slug `st-marks-chromepet` and allowlists `stmarksschool.in`.
2. The school embeds the widget on its Admissions page.
3. Parents sign in with Google, submit ratings and comments.
4. Admin approves quality reviews; the widget updates with average rating and latest reviews.
5. Search engines pick up JSON-LD and display stars in results.

## Setup

1. Install dependencies
   ```bash
   pnpm i
   ```
2. Create env files from examples
   - `apps/embed/.env.example` → `apps/embed/.env`
   - `apps/admin/.env.example` → `apps/admin/.env`

   Required variables in each app:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FUNCTIONS_URL` (e.g., `https://<project>.supabase.co/functions/v1`)

3. Supabase Auth – enable Google provider and add Redirect URIs (adjust domains):
   - `https://reviews.yourdomain.com/embed`
   - `https://reviews.yourdomain.com/admin`

4. Optional (local): serve functions with Supabase CLI
   ```bash
   # public function (no JWT required)
   supabase functions serve reviews-public --no-verify-jwt
   # protected functions (JWT required)
   supabase functions serve reviews-submit
   supabase functions serve reviews-moderate
   # domain allowlist
   supabase functions serve domains-guard --no-verify-jwt
   ```

## Run locally

Run either app:
   ```bash
   pnpm -C apps/embed dev
   pnpm -C apps/admin dev
   ```
3. Build
   ```bash
   pnpm -C apps/embed build
   pnpm -C apps/admin build
   ```

## Embed Snippet

Add this to any page to embed the widget (adjust src and styles as needed):

```html
<iframe
  src="https://reviews.yourdomain.com/embed?tenant=st-marks-chromepet"
  style="width:100%;border:0;min-height:600px"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

## API Surface (Edge Functions)

All functions live in `supabase/functions/` and return JSON with appropriate HTTP codes.

- `GET /reviews-public?tenant=<slug>&limit=&offset=`
  - Returns: `{ summary, items, tenant_id }`
  - 404 if tenant not found.

- `POST /reviews-submit`
  - Auth: `Authorization: Bearer <access_token>`
  - Body: `{ tenant_id, reviewer_id, rating, title, text }`
  - Validates rating (1..5) and text (>=10). Inserts `pending` review.

- `POST /reviews-moderate`
  - Auth: `Authorization: Bearer <access_token>`
  - Body: `{ review_id, action: 'approve' | 'reject', notes? }`
  - Requires tenant admin via RLS.

- `GET /domains-guard?tenant=<slug>&host=<refHost>`
  - Checks `tenant_domains` using service role and returns `{ allowed: true|false }`.
  - Used by the embed app to guard rendering by referrer host.

## Security

- All data access is protected by Postgres RLS.
- Public: `reviews-public` is read-only for public consumption.
- Protected: `reviews-submit` and `reviews-moderate` require a valid Supabase JWT.
- Admin checks: `reviews-moderate` relies on RLS to ensure only tenant admins can moderate.
- Domain allowlist: `domains-guard` enforces allowed domains for widgets (MVP hardening).
