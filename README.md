# daffodilz Atelier

Internal boutique management app for **daffodilz 2.0**. Tracks custom work
orders — Aari work, Maagam work, bridal wear, partywear, alterations — with
quantity, status, pricing and due dates. Built with Next.js (App Router) +
TypeScript, backed by Postgres (Neon), and styled with the same forest
green / gold / cream boutique theme as the [Website](../Website) project.

Includes simple username/password auth with two roles — **admin** (manages
staff accounts) and **receptionist** (manages work orders, can reset their
own password).

## Prerequisites

- Node.js 18+
- A Postgres database. This project is set up for [Neon](https://neon.tech)
  (free tier, no local server to run), but any Postgres connection string
  works.

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in:
   - `POSTGRES_DB` — your Postgres/Neon connection string.
   - `AUTH_SECRET` — a random secret for signing session cookies. Generate
     one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

3. Create the first admin account (tables are created automatically on
   first use, so this also bootstraps the schema):

   ```bash
   npm run create-user -- admin your-password admin
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign in.

## How it works

- `src/lib/db.ts` owns the Postgres connection pool and creates the `users`
  and `work_orders` tables if they don't exist yet.
- `src/lib/workOrders.ts` and `src/lib/users.ts` are the data-access layer —
  plain SQL queries, no ORM. Search (`GET /api/works?q=...`) is a simple
  case-insensitive `ILIKE` match across customer name, description and notes.
- `src/lib/session.ts` + `src/proxy.ts` handle auth: a signed JWT in an
  httpOnly cookie, checked on every request (Next's `proxy.ts` convention —
  the renamed successor to `middleware.ts`). Non-admins are blocked from
  `/admin/*` and `/api/admin/*`.
- `scripts/create-user.mjs` creates or resets a user directly against
  Postgres, bypassing the app entirely — see the script's header comment for
  usage. Needed to create the first admin, or to recover if everyone's
  locked out.

## Deploying (e.g. Vercel)

- Set `POSTGRES_DB` and `AUTH_SECRET` as environment variables in your
  hosting platform's project settings (not committed — `.env.local` is
  gitignored).
- To create a user against the production database from your machine, run
  the same `create-user` script with `POSTGRES_DB` pointed at production:
  ```bash
  POSTGRES_DB="<production connection string>" npm run create-user -- admin your-password admin
  ```
