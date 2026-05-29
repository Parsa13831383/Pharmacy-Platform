import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12)

  await prisma.admin.upsert({
    where: { email: 'owner@pharmacy.local' },
    update: { passwordHash, isActive: true, role: 'OWNER' },
    create: {
      email: 'owner@pharmacy.local',
      passwordHash,
      role: 'OWNER',
      isActive: true,
    },
  })

  console.log('Seed complete: owner@pharmacy.local ready')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
