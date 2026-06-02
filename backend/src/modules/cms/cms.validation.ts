import { z } from 'zod'

export const updateHomepageSettingsSchema = z.object({
  heroTitle: z.string().min(1).optional(),
  heroSubtitle: z.string().optional(),
  heroButtonText: z.string().min(1).optional(),
  heroButtonLink: z.string().optional(),

  promoBannerTitle: z.string().optional(),
  promoBannerSubtitle: z.string().optional(),

  aboutTitle: z.string().optional(),
  aboutDescription: z.string().optional(),

  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),

  isHeroEnabled: z.boolean().optional(),
  isPromoEnabled: z.boolean().optional(),
  isFeaturedProductsEnabled: z.boolean().optional(),
  isFeaturedCategoriesEnabled: z.boolean().optional(),
  isAboutEnabled: z.boolean().optional(),
})

export type UpdateHomepageSettingsInput = z.infer<typeof updateHomepageSettingsSchema>
