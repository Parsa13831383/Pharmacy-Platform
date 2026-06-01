# Connecting to Neon PostgreSQL

This guide explains how to point the backend at a hosted Neon database.
No schema changes are needed — the existing migrations handle everything.

---

## How `DATABASE_URL` flows through the project

```
backend/.env  ──►  prisma.config.ts  ──►  prisma migrate / prisma generate
                                  └─►  src/lib/prisma.ts  ──►  PrismaPg adapter (runtime)
                   src/config/env.ts  ──►  server startup (throws if missing)
                   prisma/seed.ts     ──►  npx prisma db seed
```

Every layer reads `DATABASE_URL` from the environment. Nothing is hardcoded.

---

## Step 1 — Create a Neon project

1. Go to [https://neon.tech](https://neon.tech) and sign in (or create a free account).
2. Click **New project**.
3. Choose a region close to your Render server (e.g. EU Frankfurt, US East).
4. Name it `pharmacy-platform` (or anything you like).
5. Neon creates a default database automatically.

---

## Step 2 — Copy the connection string

1. In the Neon dashboard, open your project.
2. Go to **Connection Details** (or the **Connect** button).
3. Select **Connection string** format.
4. Copy the string. It looks like:

```
postgresql://USER:PASSWORD@HOST.neon.tech/pharmacy_platform?sslmode=require
```

> **Important:** Keep the `?sslmode=require` suffix. Neon requires SSL and the
> backend's `pg` adapter respects this automatically.

---

## Step 3 — Paste into `backend/.env`

Open `backend/.env` (create it from `backend/.env.example` if it doesn't exist):

```sh
cp backend/.env.example backend/.env
```

Paste the Neon connection string as the value of `DATABASE_URL`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/pharmacy_platform?sslmode=require
ADMIN_JWT_SECRET=<generate with: openssl rand -hex 32>
ADMIN_JWT_EXPIRES_IN=7d
NODE_ENV=development
BASE_URL=http://localhost:3000
FRONTEND_URL=
```

> `.env` is git-ignored. Never commit credentials.

---

## Step 4 — Run migrations

From the `backend/` directory:

```sh
npx prisma migrate deploy
```

This applies all 5 existing migrations to the Neon database in order:

| Migration | Creates |
|-----------|---------|
| `20260529142551_add_products_and_guest_checkout_order_flow` | Products, Categories, Orders, OrderItems |
| `20260529151554_add_admin_auth` | Admin accounts |
| `20260529154113_add_inventory_adjustment` | InventoryAdjustment |
| `20260601110659_add_promotions` | Promotions, PromotionProduct |
| `20260601115548_add_product_promotion_images` | ProductImage, PromotionImage |

> Use `migrate deploy` (not `migrate dev`) against hosted databases.
> `migrate dev` is for local development only.

---

## Step 5 — Seed the database

```sh
npx prisma db seed
```

Creates the owner admin account (idempotent — safe to run multiple times):

| Field | Value |
|-------|-------|
| Email | `owner@pharmacy.local` |
| Password | `Admin123!` |
| Role | `OWNER` |

---

## Step 6 — Verify

Start the backend:

```sh
npm run dev
```

Then test the admin login:

```sh
curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@pharmacy.local","password":"Admin123!"}' | jq .
```

Expected: a JSON response with `success: true` and a `token` field.

---

## Prisma commands reference

| Command | When to use |
|---------|-------------|
| `npx prisma generate` | After any schema change, or on first install |
| `npx prisma migrate dev` | Local development — creates new migration files |
| `npx prisma migrate deploy` | Production / hosted DB — applies existing migrations only |
| `npx prisma db seed` | After first migration, to create the owner account |
| `npx prisma migrate status` | Check which migrations have been applied |

---

## Troubleshooting

**`Missing required environment variable: DATABASE_URL`**
→ `backend/.env` does not exist or `DATABASE_URL` is empty. Check Step 3.

**`SSL connection error` / `self-signed certificate`**
→ Ensure the connection string ends with `?sslmode=require`.

**`P1001: Can't reach database server`**
→ Double-check the Neon host and that your IP is not blocked (Neon allows all IPs by default on the free tier).

**`P3009: migrate found failed migrations`**
→ A previous migration partially applied. Open the Neon console's SQL editor and run:
```sql
DELETE FROM "_prisma_migrations" WHERE finished_at IS NULL;
```
Then re-run `npx prisma migrate deploy`.
