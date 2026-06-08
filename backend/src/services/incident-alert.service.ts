import { env } from '../config/env'
import prisma from '../lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface SendIncidentAlertOptions {
  severity:        IncidentSeverity
  type:            string
  title:           string
  message:         string
  orderId?:        string
  customerPhone?:  string
  endpoint?:       string
  metadata?:       Record<string, unknown>
}

export interface AlertDiagnostics {
  enabled:            boolean
  testMode:           boolean
  hasPushoverToken:   boolean
  hasPushoverUser:    boolean
  meetsMinSeverity:   boolean
  cooldownActive:     boolean
  pushoverAttempted:  boolean
  pushoverStatus:     number | null
  pushoverBody:       string | null
  pushoverError:      string | null
  pushoverPriority:   number | null
  dbLogged:           boolean
  mode:               'disabled' | 'test' | 'live'
}

// ─── Pushover priority params ─────────────────────────────────────────────────
// CRITICAL = Emergency (priority 2) — repeats every 60 s for up to 1 h until acknowledged.
// WARNING  = High     (priority 1) — delivered immediately, no repeat.
// INFO     = Normal   (priority 0) — standard delivery.

interface PushoverPriorityParams {
  priority: string
  retry?:   string
  expire?:  string
}

const PUSHOVER_PRIORITY: Record<IncidentSeverity, PushoverPriorityParams> = {
  CRITICAL: { priority: '2', retry: '60', expire: '3600' },
  WARNING:  { priority: '1' },
  INFO:     { priority: '0' },
}

// ─── Cooldown ────────────────────────────────────────────────────────────────

const cooldownMap = new Map<string, number>()
const COOLDOWN_MS = 5 * 60 * 1_000

function isCooledDown(type: string): boolean {
  const last = cooldownMap.get(type)
  return last !== undefined && Date.now() - last < COOLDOWN_MS
}

// ─── Severity filter ─────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<IncidentSeverity, number> = { INFO: 0, WARNING: 1, CRITICAL: 2 }

function meetsMinSeverity(severity: IncidentSeverity): boolean {
  return SEVERITY_ORDER[severity] >= SEVERITY_ORDER[env.INCIDENT_MIN_SEVERITY]
}

// ─── Database log ─────────────────────────────────────────────────────────────

function logToDatabase(
  opts:   SendIncidentAlertOptions,
  status: 'SENT' | 'FAILED' | 'TEST',
): Promise<boolean> {
  return prisma.incidentLog.create({
    data: {
      severity: opts.severity,
      type:     opts.type,
      title:    opts.title,
      message:  opts.message,
      orderId:  opts.orderId       ?? null,
      phone:    opts.customerPhone ?? null,
      endpoint: opts.endpoint      ?? null,
      status,
    },
  }).then(() => true).catch((err: unknown) => {
    console.error('[incidents] DB log failed (table may not exist yet — run migrations):', (err as Error).message)
    return false
  })
}

// ─── Pushover client ──────────────────────────────────────────────────────────

async function sendViaPushover(opts: SendIncidentAlertOptions): Promise<{
  status: number
  body:   string
}> {
  const token = env.PUSHOVER_APP_TOKEN
  const user  = env.PUSHOVER_USER_KEY

  const lines = [
    `Type: ${opts.type}`,
    `Severity: ${opts.severity}`,
    opts.message,
    opts.orderId       ? `Order: ${opts.orderId}`         : null,
    opts.customerPhone ? `Phone: ${opts.customerPhone}`   : null,
    opts.endpoint      ? `Endpoint: ${opts.endpoint}`     : null,
    `Time: ${new Date().toISOString()}`,
    `Env: ${env.NODE_ENV}`,
  ].filter(Boolean).join('\n')

  const priorityParams = PUSHOVER_PRIORITY[opts.severity]
  const bodyData: Record<string, string> = {
    token,
    user,
    title:   '🚨 Pharmacy Platform — Critical Incident',
    message: lines,
    ...priorityParams,
  }

  const body = new URLSearchParams(bodyData)

  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), 10_000)

  let httpStatus = 0
  let httpBody   = ''

  try {
    const res = await fetch('https://api.pushover.net/1/messages.json', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
      signal:  controller.signal,
    })

    httpStatus = res.status
    httpBody   = await res.text().catch(() => '')

    if (!res.ok) {
      throw new Error(`Pushover HTTP ${httpStatus}: ${httpBody.slice(0, 300)}`)
    }

    return { status: httpStatus, body: httpBody }
  } finally {
    clearTimeout(timer)
  }
}

// ─── Terminal logger (test mode) ──────────────────────────────────────────────

function logToTerminal(opts: SendIncidentAlertOptions): void {
  const bar = '═'.repeat(64)
  console.log(`\n${bar}`)
  console.log('  [INCIDENT ALERT — TEST MODE]')
  console.log(`  Severity : ${opts.severity}`)
  console.log(`  Type     : ${opts.type}`)
  console.log(`  Title    : ${opts.title}`)
  console.log(`  Message  : ${opts.message}`)
  if (opts.orderId)       console.log(`  Order    : ${opts.orderId}`)
  if (opts.customerPhone) console.log(`  Phone    : ${opts.customerPhone}`)
  if (opts.endpoint)      console.log(`  Endpoint : ${opts.endpoint}`)
  if (opts.metadata)      console.log(`  Metadata : ${JSON.stringify(opts.metadata)}`)
  console.log(`  Time     : ${new Date().toISOString()}`)
  console.log(`  Env      : ${env.NODE_ENV}`)
  console.log(`${bar}\n`)
}

// ─── Diagnostic send (used by the test endpoint) ─────────────────────────────
// Always runs regardless of cooldown. Returns a full diagnostic object so the
// caller can surface exact state to the developer.

export async function sendDiagnosticAlert(opts: SendIncidentAlertOptions): Promise<AlertDiagnostics> {
  const diag: AlertDiagnostics = {
    enabled:           env.INCIDENT_ALERTS_ENABLED,
    testMode:          env.INCIDENT_ALERTS_TEST_MODE,
    hasPushoverToken:  Boolean(env.PUSHOVER_APP_TOKEN),
    hasPushoverUser:   Boolean(env.PUSHOVER_USER_KEY),
    meetsMinSeverity:  meetsMinSeverity(opts.severity),
    cooldownActive:    isCooledDown(opts.type),
    pushoverAttempted: false,
    pushoverStatus:    null,
    pushoverBody:      null,
    pushoverError:     null,
    pushoverPriority:  null,
    dbLogged:          false,
    mode:              'disabled',
  }

  console.log('\n[incidents] ── Diagnostic alert triggered ──────────────────')
  console.log(`  INCIDENT_ALERTS_ENABLED   : ${diag.enabled}`)
  console.log(`  INCIDENT_ALERTS_TEST_MODE : ${diag.testMode}`)
  console.log(`  PUSHOVER_APP_TOKEN set    : ${diag.hasPushoverToken}`)
  console.log(`  PUSHOVER_USER_KEY set     : ${diag.hasPushoverUser}`)
  console.log(`  meetsMinSeverity          : ${diag.meetsMinSeverity}`)
  console.log(`  cooldownActive            : ${diag.cooldownActive}`)

  if (!diag.enabled) {
    console.log('  → INCIDENT_ALERTS_ENABLED=false, nothing will be sent.')
    console.log('[incidents] ─────────────────────────────────────────────────\n')
    return diag
  }

  if (!diag.meetsMinSeverity) {
    console.log(`  → severity ${opts.severity} below minimum ${env.INCIDENT_MIN_SEVERITY}, skipping.`)
    console.log('[incidents] ─────────────────────────────────────────────────\n')
    return diag
  }

  // Bypass cooldown for the test endpoint — reset it so the test always fires
  cooldownMap.delete(opts.type)

  if (diag.testMode) {
    diag.mode = 'test'
    logToTerminal(opts)
    diag.dbLogged = await logToDatabase(opts, 'TEST')
    console.log(`  → Test mode: printed to terminal. DB logged: ${diag.dbLogged}`)
    console.log('[incidents] ─────────────────────────────────────────────────\n')
    cooldownMap.set(opts.type, Date.now())
    return diag
  }

  // Live mode
  diag.mode = 'live'

  if (!diag.hasPushoverToken || !diag.hasPushoverUser) {
    diag.pushoverError = 'Pushover credentials missing — set PUSHOVER_APP_TOKEN and PUSHOVER_USER_KEY in .env'
    console.error(`  → ${diag.pushoverError}`)
    console.log('[incidents] ─────────────────────────────────────────────────\n')
    return diag
  }

  diag.pushoverAttempted = true
  diag.pushoverPriority  = Number(PUSHOVER_PRIORITY[opts.severity].priority)
  console.log(`  → Attempting Pushover push (priority ${diag.pushoverPriority})…`)

  try {
    const result           = await sendViaPushover(opts)
    diag.pushoverStatus    = result.status
    diag.pushoverBody      = result.body
    diag.dbLogged          = await logToDatabase(opts, 'SENT')
    cooldownMap.set(opts.type, Date.now())
    console.log(`  → Pushover success: HTTP ${result.status} | body: ${result.body}`)
  } catch (err) {
    diag.pushoverError  = (err as Error).message
    diag.dbLogged       = await logToDatabase(opts, 'FAILED')
    console.error(`  → Pushover FAILED: ${diag.pushoverError}`)
  }

  console.log('[incidents] ─────────────────────────────────────────────────\n')
  return diag
}

// ─── Standard send (called by business logic — fire-and-forget safe) ─────────

export async function sendIncidentAlert(opts: SendIncidentAlertOptions): Promise<void> {
  console.log(`[incidents] alert triggered: type=${opts.type} severity=${opts.severity}`)
  console.log(`[incidents]   enabled=${env.INCIDENT_ALERTS_ENABLED} testMode=${env.INCIDENT_ALERTS_TEST_MODE}`)

  if (!env.INCIDENT_ALERTS_ENABLED) {
    console.log('[incidents]   → disabled, skipping')
    return
  }
  if (!meetsMinSeverity(opts.severity)) {
    console.log(`[incidents]   → severity below minimum (${env.INCIDENT_MIN_SEVERITY}), skipping`)
    return
  }
  if (isCooledDown(opts.type)) {
    console.log(`[incidents]   → cooldown active for type="${opts.type}", skipping`)
    return
  }

  cooldownMap.set(opts.type, Date.now())

  if (env.INCIDENT_ALERTS_TEST_MODE) {
    logToTerminal(opts)
    logToDatabase(opts, 'TEST')
    return
  }

  // Live mode
  if (!env.PUSHOVER_APP_TOKEN || !env.PUSHOVER_USER_KEY) {
    console.error('[incidents]   → Pushover credentials missing, cannot send')
    logToDatabase(opts, 'FAILED')
    return
  }

  try {
    const result = await sendViaPushover(opts)
    console.log(`[incidents]   → Pushover success: HTTP ${result.status}`)
    logToDatabase(opts, 'SENT')
  } catch (err) {
    console.error('[incidents]   → Pushover failed:', (err as Error).message)
    logToDatabase(opts, 'FAILED')
  }
}
