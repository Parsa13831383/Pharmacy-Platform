import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { env } from './config/env'
import authRoutes from './modules/auth/auth.routes'
import { adminCategoryRouter, publicCategoryRouter } from './modules/categories/category.routes'
import { adminProductRouter, publicProductRouter } from './modules/products/product.routes'
import { adminCmsRouter, publicCmsRouter } from './modules/cms/cms.routes'
import inventoryRoutes from './modules/inventory/inventory.routes'
import checkoutRoutes from './modules/checkout/checkout.routes'
import { adminOrderRouter, publicOrderRouter } from './modules/orders/orders.routes'
import { adminPromotionRouter, publicPromotionRouter } from './modules/promotions/promotion.routes'
import reportsRouter from './modules/reports/reports.routes'
import mediaRouter from './modules/media/media.routes'

const app = express()

// ─── CORS origin check ────────────────────────────────────────────────────────
// Returns true if the origin should receive CORS headers.
// Exact list covers localhost and the main production URL.
// The Vercel pattern covers every preview deployment URL Vercel auto-generates
// (e.g. pharmacy-platform-abc123-user.vercel.app).
const EXACT_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://pharmacy-platform-lilac.vercel.app',
  ...(env.FRONTEND_URL.trim() ? [env.FRONTEND_URL.trim()] : []),
])

function isOriginAllowed(origin: string): boolean {
  if (EXACT_ORIGINS.has(origin)) return true
  // Allow any Vercel preview URL for this project
  // Pattern: https://pharmacy-platform-<hash>-<user>.vercel.app
  if (origin.startsWith('https://pharmacy-platform-') && origin.endsWith('.vercel.app')) return true
  return false
}

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.path} origin=${req.headers['origin'] ?? 'none'}`)
  next()
})

// ─── Preflight handler (Express-5-safe — plain middleware, no app.options('*')) ─
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') { next(); return }
  const origin = req.headers['origin']
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  }
  res.sendStatus(204)
})

// ─── CORS headers for all non-OPTIONS requests ────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true) // curl / Postman / server-to-server
    if (isOriginAllowed(origin)) return callback(null, true)
    console.error('[CORS] Blocked origin:', origin)
    return callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}))

// ─── Other middleware ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json())
app.use(morgan('dev'))

// ─── Debug route ──────────────────────────────────────────────────────────────
app.get('/debug/cors', (req, res) => {
  const origin = req.headers['origin'] ?? null
  res.json({
    success: true,
    origin,
    allowed: origin ? isOriginAllowed(origin) : null,
    exactOrigins: [...EXACT_ORIGINS],
    vercelPattern: 'https://pharmacy-platform-*.vercel.app',
  })
})

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/admin/auth', authRoutes)
app.use('/api/admin/categories', adminCategoryRouter)
app.use('/api/categories', publicCategoryRouter)
app.use('/api/admin/cms', adminCmsRouter)
app.use('/api/cms', publicCmsRouter)
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
// NOTE: /uploads is local filesystem only — for production use object storage.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

export default app
