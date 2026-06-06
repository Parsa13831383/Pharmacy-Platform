import prisma from '../../lib/prisma'
import { computeSegment } from '../customers/customers.service'
import type { AudienceType, CreateCampaignDraftInput } from './marketing.validation'

// Category slug/name patterns used to detect cosmetics and skin-care customers
const COSMETICS_PATTERNS = ['cosmetic', 'makeup', 'آرایش', 'آرایشی', 'makeups']
const SKINCARE_PATTERNS  = ['skin', 'skincare', 'skin-care', 'پوست', 'مراقبت']

function matchesPatterns(texts: string[], patterns: string[]): boolean {
  return texts.some(t => patterns.some(p => t.toLowerCase().includes(p.toLowerCase())))
}

// ─── Resolve category-based audience in bulk ──────────────────────────────────

async function getCustomerPhonesByCategory(patterns: string[]): Promise<Set<string>> {
  // One query: fetch all order items with their product categories
  const items = await prisma.orderItem.findMany({
    select: {
      order: { select: { customerPhone: true } },
      product: { select: { category: { select: { name: true, slug: true } } } },
    },
  })

  const phones = new Set<string>()
  for (const item of items) {
    const cat = item.product?.category
    if (!cat) continue
    if (matchesPatterns([cat.name, cat.slug], patterns)) {
      phones.add(item.order.customerPhone)
    }
  }
  return phones
}

// ─── Build audience customer list ─────────────────────────────────────────────

export async function getAudienceCustomers(audience: AudienceType) {
  const allCustomers = await prisma.customer.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      totalOrders: true,
      totalSpent: true,
      firstOrderAt: true,
      lastOrderAt: true,
      marketingOptIn: true,
    },
  })

  if (audience === 'COSMETICS' || audience === 'SKIN_CARE') {
    const patterns = audience === 'COSMETICS' ? COSMETICS_PATTERNS : SKINCARE_PATTERNS
    const matchedPhones = await getCustomerPhonesByCategory(patterns)
    return allCustomers.filter(c => matchedPhones.has(c.phone)).map(c => ({
      ...c,
      totalSpent: Number(c.totalSpent),
    }))
  }

  return allCustomers
    .filter(c => {
      if (audience === 'ALL') return true
      const seg = computeSegment(c)
      return seg === audience
    })
    .map(c => ({ ...c, totalSpent: Number(c.totalSpent) }))
}

// ─── Campaign drafts ──────────────────────────────────────────────────────────

export async function getCampaignDrafts() {
  return prisma.campaignDraft.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createCampaignDraft(input: CreateCampaignDraftInput) {
  // Compute estimated recipient count
  const audience = await getAudienceCustomers(input.audience)
  const estimatedCount = audience.filter(c => c.marketingOptIn !== false).length

  const draft = await prisma.campaignDraft.create({
    data: {
      title: input.title,
      message: input.message,
      audience: input.audience,
    },
  })

  return { draft, estimatedCount }
}

export async function getAudiencePreview(audience: AudienceType) {
  const customers = await getAudienceCustomers(audience)
  const eligible = customers.filter(c => c.marketingOptIn !== false)
  return {
    estimatedCount: eligible.length,
    preview: eligible.slice(0, 10).map(c => ({ id: c.id, name: c.name, phone: c.phone })),
  }
}
