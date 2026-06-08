import type { Request, Response } from 'express'
import { sendDiagnosticAlert } from '../../services/incident-alert.service'
import prisma from '../../lib/prisma'

export async function testAlertController(_req: Request, res: Response) {
  try {
    const diag = await sendDiagnosticAlert({
      severity: 'CRITICAL',
      type:     'TEST_ALERT',
      title:    'Test Alert',
      message:  'Developer alert system test from pharmacy platform',
      endpoint: 'POST /api/admin/incidents/test-alert',
    })

    res.json({
      success:           true,
      mode:              diag.mode,
      enabled:           diag.enabled,
      testMode:          diag.testMode,
      hasPushoverToken:  diag.hasPushoverToken,
      hasPushoverUser:   diag.hasPushoverUser,
      meetsMinSeverity:  diag.meetsMinSeverity,
      cooldownWasActive: diag.cooldownActive,
      pushoverAttempted: diag.pushoverAttempted,
      pushoverStatus:    diag.pushoverStatus,
      pushoverBody:      diag.pushoverBody,
      pushoverError:     diag.pushoverError,
      dbLogged:          diag.dbLogged,
    })
  } catch (err) {
    console.error('[incidents] test alert controller error:', err)
    res.status(500).json({ success: false, message: 'Test alert failed', error: (err as Error).message })
  }
}

export async function testEmergencyAlertController(_req: Request, res: Response) {
  try {
    const diag = await sendDiagnosticAlert({
      severity: 'CRITICAL',
      type:     'TEST_EMERGENCY_ALERT',
      title:    'Emergency Alarm Test',
      message:  'Emergency alarm test from pharmacy platform',
      endpoint: 'POST /api/admin/incidents/test-emergency-alert',
    })

    res.json({
      success:           true,
      mode:              diag.mode,
      pushoverAttempted: diag.pushoverAttempted,
      pushoverStatus:    diag.pushoverStatus,
      pushoverError:     diag.pushoverError,
      priority:          diag.pushoverPriority ?? 2,
      retry:             60,
      expire:            3600,
    })
  } catch (err) {
    console.error('[incidents] test emergency alert error:', err)
    res.status(500).json({ success: false, message: 'Test emergency alert failed' })
  }
}

export async function listIncidentsController(_req: Request, res: Response) {
  try {
    const incidents = await prisma.incidentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take:    200,
    })
    res.json({ success: true, data: { incidents } })
  } catch (err) {
    // IncidentLog table may not exist yet if the migration hasn't been applied.
    // Return empty list so the admin page doesn't crash.
    const msg = (err as Error).message ?? ''
    if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('incidentLog')) {
      console.warn('[incidents] IncidentLog table not found — run prisma migrate deploy on the server')
      res.json({ success: true, data: { incidents: [] } })
      return
    }
    console.error('[incidents] list error:', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
