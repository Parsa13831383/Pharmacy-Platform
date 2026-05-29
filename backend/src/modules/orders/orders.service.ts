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
      orderStatus: true,
      paymentStatus: true,
      paymentMethod: true,
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
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  })
  if (!order) throw new AppError('Order not found', 404)
  return order
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new AppError('Order not found', 404)

  return prisma.order.update({
    where: { id },
    data: { orderStatus: input.orderStatus as OrderStatus },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      updatedAt: true,
    },
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
