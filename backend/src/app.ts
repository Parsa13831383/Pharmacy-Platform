import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
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

app.use(express.json())
app.use(cors())
// Allow cross-origin image loading: frontend (3001) must load images served by backend (3000)
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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

export default app
