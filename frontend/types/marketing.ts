export type CampaignAudience =
  | 'ALL'
  | 'VIP'
  | 'NEW'
  | 'INACTIVE'
  | 'REGULAR'
  | 'COSMETICS'
  | 'SKIN_CARE'

export interface CampaignDraft {
  id: string
  title: string
  message: string
  audience: CampaignAudience
  createdAt: string
  updatedAt: string
}

export interface AudiencePreview {
  estimatedCount: number
  preview: { id: string; name: string; phone: string }[]
}

export interface CreateCampaignDraftInput {
  title: string
  message: string
  audience: CampaignAudience
}
