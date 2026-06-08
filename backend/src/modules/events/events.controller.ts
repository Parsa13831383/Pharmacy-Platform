import type { Request, Response } from 'express'
import { trackProductEvent } from '../customers/customers.service'

export async function trackProductEventController(req: Request, res: Response) {
  const { productId, eventType, sessionId, phone } = req.body as {
    productId?: string
    eventType?: string
    sessionId?: string
    phone?:     string
  }

  if (!productId || !eventType) {
    res.status(400).json({ success: false, message: 'productId and eventType are required' })
    return
  }

  const allowed = ['PRODUCT_VIEW', 'PRODUCT_CLICK']
  if (!allowed.includes(eventType)) {
    res.status(400).json({ success: false, message: `eventType must be one of: ${allowed.join(', ')}` })
    return
  }

  // Fire-and-forget — never let tracking fail the caller
  const trackOpts: Parameters<typeof trackProductEvent>[0] = {
    productId,
    eventType: eventType as 'PRODUCT_VIEW' | 'PRODUCT_CLICK',
  }
  if (typeof sessionId === 'string') trackOpts.sessionId = sessionId
  if (typeof phone     === 'string') trackOpts.phone     = phone

  trackProductEvent(trackOpts).catch((err) => console.error('[events] track failed:', err))

  res.json({ success: true })
}
