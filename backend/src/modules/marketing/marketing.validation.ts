import { z } from 'zod'

export const audienceValues = ['ALL', 'VIP', 'NEW', 'INACTIVE', 'REGULAR', 'COSMETICS', 'SKIN_CARE'] as const
export type AudienceType = typeof audienceValues[number]

export const createCampaignDraftSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200),
  message: z.string().min(1, 'متن پیام الزامی است').max(1600),
  audience: z.enum(audienceValues, { message: 'مخاطب نامعتبر است' }),
})

export type CreateCampaignDraftInput = z.infer<typeof createCampaignDraftSchema>
