import express from 'express'
import cors from 'cors'
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

// ─── CORS allowed origins ─────────────────────────────────────────────────────
// The Vercel URL is hardcoded so it works even if FRONTEND_URL env var is wrong.
// env.FRONTEND_URL (trimmed) is added on top to cover future domain changes.
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://pharmacy-platform-lilac.vercel.app',
]
const configuredFrontend = env.FRONTEND_URL.trim()
if (configuredFrontend && !allowedOrigins.includes(configuredFrontend)) {
  allowedOrigins.push(configuredFrontend)
}

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.path} origin=${req.headers['origin'] ?? 'none'}`)
  next()
})

// ─── Preflight — Express-5-safe middleware (no app.options('*')) ───────────────
// app.options('*', ...) uses a bare wildcard that no longer works in Express 5.
// This plain middleware intercepts every OPTIONS request before any route is reached.
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') { next(); return }
  const origin = req.headers['origin']
  if (origin && allowedOrigins.includes(origin)) {
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
    if (!origin) return callback(null, true)       // curl / Postman / server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true)
    console.error('[CORS] Blocked origin:', origin)
    return callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}))

// ─── Other middleware ──────────────────────────────────────────────────────────
// crossOriginResourcePolicy: cross-origin allows the frontend to load /uploads/* images
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json())
app.use(morgan('dev'))

// ─── Debug route — remove after confirming CORS works in production ────────────
app.get('/debug/cors', (req, res) => {
  res.json({
    success: true,
    origin: req.headers['origin'] ?? null,
    allowedOrigins,
  })
})

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
// For production, move to object storage (S3, Cloudflare R2, etc.).
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

export default app
