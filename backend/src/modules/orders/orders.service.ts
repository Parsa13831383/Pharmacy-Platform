import type { OrderStatus } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { UpdateOrderStatusInput } from './orders.validation'

export async function listAdminOrders() {
  return prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      deliveryAddress: true,
      orderStatus: true,
      paymentStatus: true,
      paymentMethod: true,
      contactMethod: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAdminOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              images: {
                where: { isPrimary: true },
                select: { imageUrl: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  })
  if (!order) throw new AppError('Order not found', 404)

  return {
    ...order,
    items: order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      productImage: item.product.images[0]?.imageUrl ?? null,
    })),
  }
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { select: { productId: true, quantity: true } },
    },
  })
  if (!order) throw new AppError('Order not found', 404)

  // Restore stock only when transitioning INTO cancelled — prevents double-restoration
  // if the PATCH is called twice with CANCELLED.
  const isCancelling =
    input.orderStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED'

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { orderStatus: input.orderStatus as OrderStatus },
      select: { id: true, orderNumber: true, orderStatus: true, updatedAt: true },
    })

    if (isCancelling) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        })
        await tx.inventoryAdjustment.create({
          data: {
            productId: item.productId,
            quantityDelta: item.quantity,
            reason: `Cancelled Order ${order.orderNumber}`,
          },
        })
      }
    }

    return updated
  })
}

export async function getPublicOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      orderStatus: true,
      createdAt: true,
    },
  })
  if (!order) throw new AppError('Order not found', 404)
  return order
}
