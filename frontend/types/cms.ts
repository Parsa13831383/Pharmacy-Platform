export interface HomepageSettings {
  id: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  heroButtonLink: string

  promoBannerTitle: string
  promoBannerSubtitle: string

  aboutTitle: string
  aboutDescription: string

  contactPhone: string
  contactWhatsapp: string

  isHeroEnabled: boolean
  isPromoEnabled: boolean
  isFeaturedProductsEnabled: boolean
  isFeaturedCategoriesEnabled: boolean
  isAboutEnabled: boolean

  createdAt: string
  updatedAt: string
}

export type UpdateHomepageSettingsInput = Partial<Omit<HomepageSettings, 'id' | 'createdAt' | 'updatedAt'>>
