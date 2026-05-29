import type { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { hashPassword, comparePassword } from '../../lib/bcrypt'
import { env } from '../../config/env'
import type { SendOtpInput, VerifyOtpInput, CreateOrderInput } from './checkout.validation'

// ─── OTP ─────────────────────────────────────────────────────────────────────

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendOtp(input: SendOtpInput) {
  const code = generateOtpCode()
  const codeHash = await hashPassword(code)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await prisma.phoneOtp.create({
    data: { phone: input.phone, codeHash, purpose: 'CHECKOUT', expiresAt },
  })

  // Expose code only in development — in production, the SMS provider would send it
  if (env.NODE_ENV === 'development') {
    return { message: 'OTP sent', code }
  }
  return { message: 'OTP sent' }
}

export async function verifyOtp(input: VerifyOtpInput) {
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone: input.phone, purpose: 'CHECKOUT', isUsed: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) throw new AppError('No active OTP found for this phone', 400)
  if (otp.expiresAt < new Date()) throw new AppError('OTP has expired', 400)

  const valid = await comparePassword(input.code, otp.codeHash)
  if (!valid) throw new AppError('Invalid OTP code', 400)

  await prisma.phoneOtp.update({ where: { id: otp.id }, data: { isUsed: true } })

  return { verified: true }
}

// ─── Order ───────────────────────────────────────────────────────────────────

type LineItem = {
  productId: string
  productNameSnapshot: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

function buildOrderNumber(dateStr: string, todayCount: number): string {
  return `ORD-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`
}

export async function createOrder(input: CreateOrderInput) {
  // Verify the customer completed OTP within the last 30 minutes
  const verifiedOtp = await prisma.phoneOtp.findFirst({
    where: {
      phone: input.customerPhone,
      purpose: 'CHECKOUT',
      isUsed: true,
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!verifiedOtp) {
    throw new AppError('Phone number not verified. Please verify your OTP first.', 401)
  }

  return prisma.$transaction(async (tx) => {
    // ── 1. Generate order number ───────────────────────────────────────────
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const dateStr = `${y}${m}${d}`

    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })
    const orderNumber = buildOrderNumber(dateStr, todayCount)

    // ── 2. Load products ───────────────────────────────────────────────────
    const productIds = [...new Set(input.items.map((i) => i.productId))]
    const products = await tx.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    // ── 3. Validate stock (aggregate across duplicate productIds) ──────────
    const stockChanges = new Map<string, { totalQty: number; newStock: number }>()

    for (const item of input.items) {
      const product = productMap.get(item.productId)
      if (!product) throw new AppError(`Product not found: ${item.productId}`, 404)
      if (!product.isActive) throw new AppError(`Product "${product.name}" is not available`, 400)

      const prev = stockChanges.get(item.productId)
      const totalQty = (prev?.totalQty ?? 0) + item.quantity
      stockChanges.set(item.productId, { totalQty, newStock: product.stockQuantity - totalQty })
    }

    for (const [productId, { newStock }] of stockChanges) {
      if (newStock < 0) {
        const product = productMap.get(productId)
        throw new AppError(`Insufficient stock for "${product?.name ?? productId}"`, 400)
      }
    }

    // ── 4. Build line items ────────────────────────────────────────────────
    const lineItems: LineItem[] = input.items.map((item) => {
      const product = productMap.get(item.productId)!
      const unitPrice =
        product.discountedPrice !== null ? Number(product.discountedPrice) : Number(product.price)
      return {
        productId: item.productId,
        productNameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      }
    })

    const totalAmount = lineItems.reduce((sum, li) => sum + li.totalPrice, 0)

    // ── 5. Create order ────────────────────────────────────────────────────
    const orderData: Prisma.OrderCreateInput = {
      orderNumber,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      contactMethod: input.contactMethod,
      paymentMethod: input.paymentMethod,
      totalAmount,
    }
    if (input.deliveryNotes !== undefined) orderData.deliveryNotes = input.deliveryNotes

    const order = await tx.order.create({ data: orderData })

    // ── 6. Create order items ──────────────────────────────────────────────
    for (const li of lineItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: li.productId,
          productNameSnapshot: li.productNameSnapshot,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          totalPrice: li.totalPrice,
        },
      })
    }

    // ── 7. Deduct stock + audit (one record per product) ───────────────────
    for (const [productId, { newStock, totalQty }] of stockChanges) {
      await tx.product.update({ where: { id: productId }, data: { stockQuantity: newStock } })
      await tx.inventoryAdjustment.create({
        data: { productId, quantityDelta: -totalQty, reason: `Order ${orderNumber}` },
      })
    }

    return { order, items: lineItems }
  })
}
