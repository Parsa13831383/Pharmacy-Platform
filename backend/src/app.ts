import express from 'express'
import cors from 'cors'
import type { CorsOptions } from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { env } from './config/env'
import authRoutes from './modules/auth/auth.routes'
import categoryRoutes from './modules/categories/category.routes'
import { adminProductRouter, publicProductRouter } from './modules/products/product.routes'
import inventoryRoutes from './modules/inventory/inventory.routes'
import checkoutRoutes from './modules/checkout/checkout.routes'
import { adminOrderRouter, publicOrderRouter } from './modules/orders/orders.routes'
import { adminPromotionRouter, publicPromotionRouter } from './modules/promotions/promotion.routes'
import reportsRouter from './modules/reports/reports.routes'
import mediaRouter from './modules/media/media.routes'

const app = express()

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Build the allowed-origins list. The Vercel URL is hardcoded as a safety net
// so it works even if the FRONTEND_URL env var has a typo or trailing space.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://pharmacy-platform-lilac.vercel.app', // production frontend
])

// Also add whatever is in FRONTEND_URL (trimmed) — covers future redeploys
const frontendUrl = env.FRONTEND_URL.trim()
if (frontendUrl) ALLOWED_ORIGINS.add(frontendUrl)

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header) and curl/Postman
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} is not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // some legacy browsers choke on 204
}

// Explicit preflight handler — must be registered BEFORE any routes or other middleware
app.options('*', cors(corsOptions))
// Apply CORS headers to all other requests
app.use(cors(corsOptions))

// ─── Other middleware ──────────────────────────────────────────────────────────
// Allow cross-origin image loading so the frontend domain can load /uploads/* files
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json())
app.use(morgan('dev'))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/admin/auth', authRoutes)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', adminProductRouter)
app.use('/api/admin/inventory', inventoryRoutes)
app.use('/api/admin/orders', adminOrderRouter)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/admin/promotions', adminPromotionRouter)
app.use('/api/admin/reports', reportsRouter)
app.use('/api/products', publicProductRouter)
app.use('/api/orders', publicOrderRouter)
app.use('/api/promotions', publicPromotionRouter)
app.use('/api/admin/media', mediaRouter)
// NOTE: /uploads is served from the local filesystem for the demo only.
// In production, move media uploads to an object-storage service (S3, Cloudflare R2, etc.)
// and update media.controller.ts to use cloud URLs instead of building local ones.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

export default app
