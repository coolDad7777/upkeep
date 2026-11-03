# CrewCompliant

**Compliance tracking for electrical contractors.**

Stop losing jobs over expired licenses. CrewCompliant tracks employee licenses, insurance certificates, safety certifications, and vehicle documents for your crew — and automatically sends reminders before anything expires.

---

## What this is

CrewCompliant is a focused micro-SaaS targeting small electrical contracting companies (3–50 employees). It solves the recurring, expensive problem of expired licenses and documents causing work stoppages, failed inspections, and general contractor rejections.

**Target customer:** Owner or office manager of an electrical contracting company with 3–50 employees who has been burned by an expired license, lapsed insurance, or missing COI at least once.

**Revenue model:** Monthly SaaS subscriptions, $49–$199/month based on crew size.

---

## Market validation summary

### Why electrical contractors

| Factor | Score | Notes |
|---|---|---|
| Problem urgency | HIGH | Expired license = can't pull permits = job stops |
| Frequency | HIGH | Licenses, insurance, OSHA training all expire |
| Ability to pay | MEDIUM-HIGH | Licensed electricians earn well, can afford $49–$99/mo |
| Market size | MEDIUM | ~70,000 electrical contracting businesses in US |
| Competition | MEDIUM | No affordable, focused tool; GC platforms are overpriced |
| Ease of reach | MEDIUM | NECA, Facebook groups, r/electricians, LinkedIn |
| Legal risk | LOW | Admin tracking tool, not compliance certification |
| Build complexity | LOW-MEDIUM | Standard CRUD + file uploads + email reminders |
| Retention | HIGH | Documents expire every year; recurring need |

### Niche validation risks (be honest)

- This analysis is based on reasoning and publicly available information, NOT verified customer interviews
- No paying customers have been acquired yet
- Conversion rates, churn, and support burden are assumptions
- The market may be too fragmented for easy acquisition at low CAC
- GC platforms may expand into this space as a bundled feature

### Validation plan (do this before spending money on marketing)

1. Post in r/electricians: "How do you track license and insurance expirations for your crew?"
2. Post in Facebook groups: "Electrical Contractor Business Owners" (~10k members)
3. Reach out to 10 electrical contractors on LinkedIn with a 3-question survey
4. Offer 3–5 free "founding member" accounts in exchange for feedback calls
5. Only invest in paid acquisition after 3+ paying customers confirm ongoing value

---

## Positioning

**One-sentence value proposition:**  
CrewCompliant tracks every license, insurance certificate, and certification for your electrical crew and sends automatic alerts before anything expires — so you never get caught off guard on a job site.

**Against spreadsheets:** Spreadsheets don't send reminders. CrewCompliant does.  
**Against general field-service software:** Those cost $200–$500/month and are built for scheduling, invoicing, and dispatch. You don't need that. You need one focused tool that handles compliance.  
**Against doing nothing:** One work stoppage from an expired license costs more than a year of CrewCompliant.

---

## Technology stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (base-ui) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth |
| File storage | Supabase Storage (private, signed URLs) |
| Email | Resend |
| Payments | Stripe |
| Hosting | Render |
| Background jobs | Render Cron (calls `/api/reminders/send` daily at 8am UTC) |

---

## Local development setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Stripe](https://stripe.com) account (test mode)
- A [Resend](https://resend.com) account (free tier: 3k emails/month)
- A [Render](https://render.com) account (for deployment)

### Steps

```bash
# 1. Clone and install
git clone <this repo>
cd crewcompliant
npm install

# 2. Create .env.local from the example
cp .env.example .env.local
# Fill in all the values (see below)

# 3. Set up the database
# In Supabase SQL Editor, run:
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_storage.sql

# 4. Start development server
npm run dev

# 5. Open http://localhost:3001
```

### Environment variables

See `.env.example` for all required variables.

**Supabase:** Create a project at supabase.com. Find your URL, anon key, and service role key in Project Settings > API.

**Stripe:** 
1. Create your product in Stripe dashboard
2. Create 6 prices (Starter/Growth/Pro × Monthly/Annual)
3. Copy the price IDs to your `.env.local`
4. Set up a webhook pointing to `/api/billing/webhook` for these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

**Resend:** Verify your sending domain at resend.com. Update the `from` addresses in `src/app/api/reminders/send/route.ts` and `src/app/api/documents/request/route.ts`.

**ADMIN_EMAILS:** Comma-separated list of emails that can access `/admin`. If empty, any logged-in user can access admin (not recommended for production).

---

## Deployment to Render

### One-time setup

1. Push this repo to GitHub
2. In Render dashboard, create a new "Web Service"
3. Connect your GitHub repo
4. Render will detect the `render.yaml` and configure services automatically
5. Add all environment variables from `.env.example`
6. Set `NEXT_PUBLIC_APP_URL` to your Render URL (e.g., `https://crewcompliant.onrender.com`)
7. Deploy

### Cron job (reminders)

The `render.yaml` includes a cron service that calls `/api/reminders/send` daily at 8am UTC. Set `APP_HOST` and `CRON_SECRET` environment variables for the cron service.

### Rollback procedure

Render keeps previous deploys. In the Render dashboard:
1. Go to your service → Deploys
2. Click the previous successful deploy
3. Click "Rollback to this deploy"

---

## Database migrations

Supabase doesn't have a CLI migration runner in this setup. To apply migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Paste the migration SQL
3. Click Run

For production schema changes, always test in a staging environment first.

---

## Security model

- **Tenant isolation:** Row Level Security (RLS) on every table. Users can only access data from their own company.
- **File storage:** Supabase Storage with RLS. Signed URLs expire after 5 minutes.
- **File validation:** Only PDF, JPG, PNG, WebP allowed. Max 10MB.
- **Auth:** Supabase Auth with email/password and magic link.
- **Admin access:** Restricted by `ADMIN_EMAILS` environment variable.
- **Stripe:** Payments go through Stripe. No card data stored in our database.

**Important:** CrewCompliant is an administrative tracking tool. It does NOT certify legal or regulatory compliance. All reports include this disclaimer.

---

## Architecture decisions

**Why Supabase:** Managed PostgreSQL + Auth + Storage in one place, with Row Level Security for tenant isolation. Avoids the need to build custom auth or file storage.

**Why Resend:** Simple API, reliable deliverability, generous free tier.

**Why Render:** Simple deployment from GitHub, reasonable pricing, easy cron jobs.

**Why not AI features:** No validated use case yet. AI would add cost and complexity without confirmed user value. Add it only after users ask for it specifically.

---

## Launch readiness checklist

Before considering the product "launched":

- [ ] 3+ paying pilot customers (not free trials)
- [ ] Document upload working reliably
- [ ] Email reminders sending correctly
- [ ] Stripe billing working (payment, cancellation, webhooks)
- [ ] Tenant isolation verified (no data leaking between companies)
- [ ] No critical security issues
- [ ] Clear cancellation process for customers
- [ ] Working onboarding flow (test with someone who has never seen it)
- [ ] At least one repeatable acquisition channel identified

---

## Operations

### Weekly owner tasks (after launch, ~30 min/week)

1. Check `/admin` for new accounts and payment failures
2. Read any support tickets
3. Check Render error logs for any crashes
4. Review reminder sending logs

### Key metrics to track

- Trial-to-paid conversion rate (target: >20%)
- Monthly churn (target: <5%)
- Time to first uploaded document (target: <10 minutes)
- Support tickets per company per month (target: <1)

---

## Pricing

| Plan | Monthly | Annual (equiv.) | Limit |
|---|---|---|---|
| Starter | $49/month | $39/month ($468/year) | 10 people |
| Growth | $99/month | $79/month ($948/year) | 50 people |
| Pro | $199/month | $159/month ($1,908/year) | 200 people |

All plans include unlimited documents, email reminders, document requests, and reports.

---

## Roadmap (only build these after first niche is profitable)

1. **HVAC expansion** — Add EPA 608, refrigerant handling docs. Same product, different positioning.
2. **Plumbing expansion** — Similar license and insurance types.
3. **GC view** — Let a general contractor collect COIs from multiple subs in one portal.
4. **Bulk CSV import** — For companies migrating from spreadsheets.
5. **API/Zapier** — For companies with existing HR software.
6. **White label** — For industry associations to offer to members.

---

## Disclaimer

CrewCompliant is an administrative document tracking tool. It does not provide legal, compliance, or licensing advice. The compliance score and status indicators reflect document expiration dates as entered by users — not actual legal or regulatory standing. Always consult qualified professionals for regulatory requirements in your jurisdiction.
