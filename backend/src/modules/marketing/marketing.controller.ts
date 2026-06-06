import type { Request, Response } from 'express'
import { createCampaignDraftSchema, audienceValues, type AudienceType } from './marketing.validation'
import { getCampaignDrafts, createCampaignDraft, getAudiencePreview } from './marketing.service'

export async function listDraftsController(_req: Request, res: Response) {
  try {
    const drafts = await getCampaignDrafts()
    res.json({ success: true, data: { drafts } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function createDraftController(req: Request, res: Response) {
  const parsed = createCampaignDraftSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' })
    return
  }
  try {
    const result = await createCampaignDraft(parsed.data)
    res.status(201).json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function audiencePreviewController(req: Request, res: Response) {
  const audience = req.query['audience'] as string
  if (!audienceValues.includes(audience as AudienceType)) {
    res.status(400).json({ success: false, message: 'مخاطب نامعتبر است' })
    return
  }
  try {
    const result = await getAudiencePreview(audience as AudienceType)
    res.json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
