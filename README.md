# RMDW SiteDesk

SiteDesk is a multi-tenant commercial property maintenance workspace for customer intake, office dispatch, field proof, quote approval, and invoice-ready closeout.

## Production architecture

- Vite/React frontend with Vercel Functions under `api/`
- Neon Postgres with an isolated `sd_` schema
- Database-backed, opaque HttpOnly sessions
- Tenant-scoped authorization for `customer`, `office`, `technician`, and `admin`
- Private client uploads through Vercel Blob; upload tokens and downloads are issued only after server-side job and tenant authorization
- Passwords derived with Node `scrypt`; sign-in attempts are throttled in Postgres

The API fails closed when required services are absent. It does not expose a demo account or claim that an uninitialized deployment is authenticated.

## Environment contract

Copy `.env.example` to `.env.local` and provide:

- `DATABASE_URL` — Neon pooled connection string with TLS
- `SESSION_SECRET` — long random server-only value used when hashing rate-limit identifiers
- `SITEDESK_BOOTSTRAP_TOKEN` — private, temporary token for the first administrator setup; remove it after initialization
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token required for media uploads

Never expose these values through `VITE_` variables or commit them.

## Setup

```bash
npm install
npm run db:migrate
npm run dev
```

With `SITEDESK_BOOTSTRAP_TOKEN` configured, the first visit presents a one-time administrator setup form. After the administrator is created, remove that environment variable and redeploy. Additional users are created by an authenticated administrator through the `create-user` API action.

## Verification

```bash
npm run typecheck:api
npm run lint
npm run build
npm audit --omit=dev
```

The schema uses `tenant_id` on every tenant-owned record and composite foreign keys where entities cross-reference one another. Every query that returns or mutates customer, technician, job, quote, update, property, or media data includes the authenticated tenant identifier; customer and technician reads are further constrained to their property or assignment.
