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

// Allowed CORS origins: always include local dev, plus the deployed frontend URL when set
const corsOrigins = ['http://localhost:3000', 'http://localhost:3001']
if (env.FRONTEND_URL) corsOrigins.push(env.FRONTEND_URL)

app.use(cors({ origin: corsOrigins, credentials: true }))
// Allow cross-origin image loading so the frontend domain can load /uploads/* files
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

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
