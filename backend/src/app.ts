import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './modules/auth/auth.routes'
import categoryRoutes from './modules/categories/category.routes'
import { adminProductRouter, publicProductRouter } from './modules/products/product.routes'

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

app.use('/api/admin/auth', authRoutes)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', adminProductRouter)
app.use('/api/products', publicProductRouter)

export default app
