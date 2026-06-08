import type { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { normalizePhone } from '../../lib/phone'
import { sendOtp as _sendOtp, verifyOtp as _verifyOtp } from '../../services/otp.service'
import type { SendOtpInput, VerifyOtpInput, CreateOrderInput } from './checkout.validation'
import { upsertCustomerFromOrder } from '../customers/customers.service'
import { sendIncidentAlert } from '../../services/incident-alert.service'

// ─── OTP (delegates to otp.service) ──────────────────────────────────────────

export async function sendOtp(input: SendOtpInput): Promise<{ message: string }> {
  await _sendOtp(input.phone)
  return { message: 'کد تایید ارسال شد.' }
}

export async function verifyOtp(input: VerifyOtpInput): Promise<{ verified: boolean }> {
  await _verifyOtp(input.phone, input.code)
  return { verified: true }
}

// ─── Order ───────────────────────────────────────────────────────────────────

type LineItem = {
  productId:           string
  productNameSnapshot: string
  quantity:            number
  unitPrice:           number
  totalPrice:          number
}

function buildOrderNumber(dateStr: string, todayCount: number): string {
  return `ORD-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`
}

// ─── Post-order integrity check ───────────────────────────────────────────────
// Runs asynchronously after the transaction commits. Triggers a CRITICAL alert
// if the order record, customer upsert, or stock counts look wrong.
// Never throws — never blocks the response.

async function runOrderIntegrityCheck(
  order: { id: string; customerPhone: string; customerName: string; deliveryAddress: string; totalAmount: unknown },
  items: LineItem[],
  phone: string,
): Promise<void> {
  const failures: string[] = []

  if (!order.id)              failures.push('order.id missing')
  if (!order.customerPhone)   failures.push('customerPhone missing')
  if (!order.customerName)    failures.push('customerName missing')
  if (!order.deliveryAddress) failures.push('deliveryAddress missing')
  if (!items.length)          failures.push('order has no items')
  if (!order.totalAmount || Number(order.totalAmount) <= 0)
                              failures.push('totalAmount is zero or missing')

  // Verify customer record was created / updated
  try {
    const customer = await prisma.customer.findUnique({ where: { phone } })
    if (!customer) failures.push('customer record missing after upsert')
  } catch {
    failures.push('customer lookup failed')
  }

  // Verify no product stock went negative
  try {
    const productIds = items.map((i) => i.productId)
    const negStock   = await prisma.product.findMany({
      where:  { id: { in: productIds }, stockQuantity: { lt: 0 } },
      select: { id: true, name: true, stockQuantity: true },
    })
    for (const p of negStock) {
      failures.push(`negative stock: "${p.name}" (${p.stockQuantity})`)
    }
  } catch {
    failures.push('stock verification query failed')
  }

  if (failures.length > 0) {
    console.error('[checkout] integrity failures:', failures)
    await sendIncidentAlert({
      severity:       'CRITICAL',
      type:           'ORDER_INTEGRITY_FAILURE',
      title:          'Order integrity check failed',
      message:        failures.join(' | '),
      orderId:        order.id,
      customerPhone:  phone,
      endpoint:       'POST /api/checkout/order',
    })
  }
}

export async function createOrder(input: CreateOrderInput) {
  const customerPhone = normalizePhone(input.customerPhone)

  // Require a verified OTP within the last 30 minutes
  const verifiedOtp = await prisma.phoneOtp.findFirst({
    where: {
      phone:     customerPhone,
      purpose:   'CHECKOUT',
      isUsed:    true,
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1_000) },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!verifiedOtp) {
    throw new AppError('شماره موبایل تایید نشده است. لطفاً ابتدا کد تایید دریافت کنید.', 401)
  }

  const result = await prisma.$transaction(async (tx) => {
    // ── 1. Order number ────────────────────────────────────────────────────
    const now     = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayCount  = await tx.order.count({ where: { createdAt: { gte: todayStart } } })
    const orderNumber = buildOrderNumber(dateStr, todayCount)

    // ── 2. Load products ───────────────────────────────────────────────────
    const productIds = [...new Set(input.items.map((i) => i.productId))]
    const products   = await tx.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    // ── 3. Validate + aggregate stock ────────────────────────────────────
    const stockChanges = new Map<string, { totalQty: number; newStock: number }>()

    for (const item of input.items) {
      const product = productMap.get(item.productId)
      if (!product)         throw new AppError(`محصول یافت نشد: ${item.productId}`, 404)
      if (!product.isActive) throw new AppError(`محصول "${product.name}" موجود نیست.`, 400)

      const prev     = stockChanges.get(item.productId)
      const totalQty = (prev?.totalQty ?? 0) + item.quantity
      stockChanges.set(item.productId, { totalQty, newStock: product.stockQuantity - totalQty })
    }

    for (const [productId, { newStock }] of stockChanges) {
      if (newStock < 0) {
        const product = productMap.get(productId)
        throw new AppError(`موجودی کافی برای "${product?.name ?? productId}" وجود ندارد.`, 400)
      }
    }

    // ── 4. Build line items ────────────────────────────────────────────────
    const lineItems: LineItem[] = input.items.map((item) => {
      const product   = productMap.get(item.productId)!
      const unitPrice = product.discountedPrice !== null
        ? Number(product.discountedPrice)
        : Number(product.price)
      return {
        productId:           item.productId,
        productNameSnapshot: product.name,
        quantity:            item.quantity,
        unitPrice,
        totalPrice:          unitPrice * item.quantity,
      }
    })

    const totalAmount = lineItems.reduce((sum, li) => sum + li.totalPrice, 0)

    // ── 5. Create order ────────────────────────────────────────────────────
    const orderData: Prisma.OrderCreateInput = {
      orderNumber,
      customerName:      input.customerName,
      customerPhone,
      deliveryAddress:   input.deliveryAddress,
      deliveryLatitude:  input.deliveryLatitude,
      deliveryLongitude: input.deliveryLongitude,
      contactMethod:     input.contactMethod,
      paymentMethod:     input.paymentMethod,
      totalAmount,
    }
    if (input.deliveryNotes !== undefined) orderData.deliveryNotes = input.deliveryNotes

    const order = await tx.order.create({ data: orderData })

    // ── 6. Create order items ──────────────────────────────────────────────
    for (const li of lineItems) {
      await tx.orderItem.create({
        data: {
          orderId:             order.id,
          productId:           li.productId,
          productNameSnapshot: li.productNameSnapshot,
          quantity:            li.quantity,
          unitPrice:           li.unitPrice,
          totalPrice:          li.totalPrice,
        },
      })
    }

    // ── 7. Deduct stock + audit ────────────────────────────────────────────
    for (const [productId, { newStock, totalQty }] of stockChanges) {
      await tx.product.update({ where: { id: productId }, data: { stockQuantity: newStock } })
      await tx.inventoryAdjustment.create({
        data: { productId, quantityDelta: -totalQty, reason: `Order ${orderNumber}` },
      })
    }

    return { order, items: lineItems }
  })

  // Upsert customer record — outside the transaction so a failure here
  // never rolls back a successfully placed order.
  upsertCustomerFromOrder({
    phone:      customerPhone,
    name:       input.customerName,
    amount:     result.order.totalAmount as unknown as number,
    orderedAt:  result.order.createdAt,
  }).catch((err) => {
    console.error('[checkout] customer upsert failed (non-fatal):', err)
  })

  // Post-commit integrity check — fire-and-forget, never blocks response.
  runOrderIntegrityCheck(result.order, result.items, customerPhone).catch((err) => {
    console.error('[checkout] integrity check error:', err)
  })

  return result
}
