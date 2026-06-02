import type { Request, Response } from 'express'
import { updateHomepageSettingsSchema } from './cms.validation'
import { getHomepageSettings, updateHomepageSettings } from './cms.service'

export async function getHomepageSettingsController(_req: Request, res: Response) {
  try {
    const settings = await getHomepageSettings()
    res.json({ success: true, data: { settings } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function updateHomepageSettingsController(req: Request, res: Response) {
  const result = updateHomepageSettingsSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const settings = await updateHomepageSettings(result.data)
    res.json({ success: true, data: { settings } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
