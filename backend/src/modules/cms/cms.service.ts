import prisma from '../../lib/prisma'
import type { UpdateHomepageSettingsInput } from './cms.validation'

async function ensureSettings() {
  const existing = await prisma.homepageSettings.findFirst()
  if (existing) return existing
  return prisma.homepageSettings.create({ data: {} })
}

export async function getHomepageSettings() {
  return ensureSettings()
}

export async function updateHomepageSettings(data: UpdateHomepageSettingsInput) {
  const settings = await ensureSettings()
  // Strip undefined values — Prisma with exactOptionalPropertyTypes rejects them
  // exactOptionalPropertyTypes requires no undefined values in Prisma input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as any
  return prisma.homepageSettings.update({ where: { id: settings.id }, data: clean })
}
