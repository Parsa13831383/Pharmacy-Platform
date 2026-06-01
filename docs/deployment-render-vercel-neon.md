# Pharmacy Platform — Demo Deployment Guide

> **Stack:** Neon PostgreSQL · Render (backend) · Vercel (frontend)
>
> These are manual steps. Nothing deploys automatically.

---

## Overview

```
Browser → Vercel (Next.js frontend) → Render (Express API) → Neon (PostgreSQL)
```

Uploads (`/uploads`) are served from Render's local filesystem.
**For a production system, migrate uploads to an object-storage service (AWS S3, Cloudflare R2, etc.).**

---

## Step 1 — Neon PostgreSQL

1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Create a new project (e.g. `pharmacy-platform`).
3. Neon creates a default database. Copy the **Connection string** — it looks like:
   ```
   postgresql://USER:PASSWORD@HOST/pharmacy_platform?sslmode=require
   ```
4. Save this — you will use it as `DATABASE_URL` in both Render and locally.

---

## Step 2 — Render Web Service (Backend)

### 2a. Create the service

1. Go to [https://render.com](https://render.com) and sign in.
2. **New → Web Service**.
3. Connect your GitHub repository.
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `pharmacy-backend` (or any name) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (for demo) |

### 2b. Environment variables

Set these in **Render → Environment → Add Variable**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `ADMIN_JWT_SECRET` | A long random string (min 32 chars, e.g. `openssl rand -hex 32`) |
| `ADMIN_JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `BASE_URL` | Your Render service URL, e.g. `https://pharmacy-backend.onrender.com` |
| `FRONTEND_URL` | Your Vercel URL, e.g. `https://pharmacy-frontend.vercel.app` (set **after** Vercel deploy) |
| `PORT` | Leave unset — Render injects this automatically |

> **Note:** Set `FRONTEND_URL` after you deploy the frontend and know its URL.
> Then redeploy the backend (Render → Manual Deploy) so the CORS list is updated.

### 2c. Deploy

Click **Create Web Service**. Render will:
1. `npm install` — install dependencies (including devDeps for `tsx` and `prisma`)
2. `npx prisma generate` — compile Prisma client
3. `npx prisma migrate deploy` — run all migrations against Neon (reads `DATABASE_URL` via `prisma.config.ts`)
4. `npm run build` — compile TypeScript to `dist/`
5. `npm start` — run `node dist/server.js`

Wait for the deploy to show **Live**.

### 2d. Seed the database (run once)

After the first successful deploy, open **Render → Shell** tab and run:

```sh
npx prisma db seed
```

This creates the owner admin account:
- **Email:** `owner@pharmacy.local`
- **Password:** `Admin123!`

### 2e. Verify backend

Open in browser:
```
https://pharmacy-backend.onrender.com/health
```
Expected response:
```json
{ "success": true, "message": "OK" }
```

---

## Step 3 — Vercel (Frontend)

### 3a. Create the project

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. **Add New → Project**.
3. Import your GitHub repository.
4. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js (auto-detected) |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |

### 3b. Environment variables

Set in **Vercel → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://pharmacy-backend.onrender.com` |

### 3c. Deploy

Click **Deploy**. Vercel will run `next build` and deploy.

After deploy you will have a URL like `https://pharmacy-frontend.vercel.app`.

### 3d. Update CORS on Render

Go back to Render, add/update the `FRONTEND_URL` env var:
```
FRONTEND_URL=https://pharmacy-frontend.vercel.app
```
Then click **Manual Deploy → Deploy latest commit** to restart with the updated CORS list.

---

## Step 4 — Test checklist

- [ ] `GET https://pharmacy-backend.onrender.com/health` returns `{ "success": true }`
- [ ] Frontend home page loads at Vercel URL
- [ ] Admin login works at `/admin/login` with `owner@pharmacy.local` / `Admin123!`
- [ ] Admin can create a category
- [ ] Admin can create a product
- [ ] Admin can upload a product image (image shows in product card)
- [ ] Public product catalog loads at `/products`
- [ ] Cart works (add, remove, quantity change)
- [ ] Checkout flow completes (enter phone, OTP code shown in backend logs)
- [ ] Order tracking works at `/track-order`
- [ ] Reports dashboard loads at `/admin/reports`

---

## Environment variables — quick reference

### Render (backend)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Neon connection string |
| `ADMIN_JWT_SECRET` | ✅ | Min 32-char random string |
| `ADMIN_JWT_EXPIRES_IN` | ✅ | e.g. `7d` |
| `NODE_ENV` | ✅ | `production` |
| `BASE_URL` | ✅ | Render service public URL |
| `FRONTEND_URL` | ✅ | Vercel frontend URL |
| `SMSIR_ENABLED` | ❌ optional | `false` unless SMS.ir is set up |
| `SMSIR_API_KEY` | ❌ optional | SMS.ir API key |
| `SMSIR_TEMPLATE_ID` | ❌ optional | SMS.ir OTP template ID |

### Vercel (frontend)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ | Full Render backend URL (no trailing slash) |

---

## Notes

### Free-tier limitations

- **Render Free:** The service spins down after 15 min of inactivity. The first request after sleep takes ~30–60 s to wake up. Upgrade to a paid plan for always-on.
- **Neon Free:** 0.5 GB storage, one compute. Sufficient for demo.
- **Vercel Free:** Unlimited hobby deployments. Sufficient for demo.

### Uploaded images

Product and promotion images are stored on Render's **ephemeral local filesystem**. They will be deleted on every redeploy or service restart. For a real deployment, integrate an object-storage service and update `backend/src/modules/media/media.controller.ts` to upload files there and store the cloud URL in `imageUrl`.

### OTP in demo mode

The OTP for checkout is printed to the backend logs (Render Logs tab) in the current implementation. There is no SMS provider configured by default.
