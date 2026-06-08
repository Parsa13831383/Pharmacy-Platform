import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('Backfilling customers from orders…')

  const orders = await prisma.order.findMany({
    select: {
      customerPhone: true,
      customerName:  true,
      totalAmount:   true,
      createdAt:     true,
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`  Found ${orders.length} orders.`)

  type Agg = {
    name:         string
    totalOrders:  number
    totalSpent:   number
    firstOrderAt: Date
    lastOrderAt:  Date
  }

  const map = new Map<string, Agg>()
  for (const o of orders) {
    const phone = o.customerPhone
    const prev  = map.get(phone)
    if (prev) {
      prev.totalOrders++
      prev.totalSpent += Number(o.totalAmount)
      if (o.createdAt < prev.firstOrderAt) prev.firstOrderAt = o.createdAt
      if (o.createdAt > prev.lastOrderAt)  prev.lastOrderAt  = o.createdAt
      prev.name = o.customerName
    } else {
      map.set(phone, {
        name:         o.customerName,
        totalOrders:  1,
        totalSpent:   Number(o.totalAmount),
        firstOrderAt: o.createdAt,
        lastOrderAt:  o.createdAt,
      })
    }
  }

  let upserted = 0
  for (const [phone, agg] of map) {
    await prisma.customer.upsert({
      where:  { phone },
      update: {
        name:         agg.name,
        totalOrders:  agg.totalOrders,
        totalSpent:   agg.totalSpent,
        firstOrderAt: agg.firstOrderAt,
        lastOrderAt:  agg.lastOrderAt,
      },
      create: {
        phone,
        name:         agg.name,
        totalOrders:  agg.totalOrders,
        totalSpent:   agg.totalSpent,
        firstOrderAt: agg.firstOrderAt,
        lastOrderAt:  agg.lastOrderAt,
      },
    })
    upserted++
    if (upserted % 50 === 0) process.stdout.write(`  Upserted ${upserted}…\r`)
  }

  console.log(`\nDone. Upserted ${upserted} customers from ${orders.length} orders.`)
  await prisma.$disconnect()
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
