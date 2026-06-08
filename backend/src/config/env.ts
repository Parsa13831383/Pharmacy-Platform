import 'dotenv/config'

function get(key: string): string {
  const value = process.env[key]
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getOr(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  DATABASE_URL: get('DATABASE_URL'),
  ADMIN_JWT_SECRET: get('ADMIN_JWT_SECRET'),
  ADMIN_JWT_EXPIRES_IN: getOr('ADMIN_JWT_EXPIRES_IN', '7d'),
  NODE_ENV: getOr('NODE_ENV', 'development'),
  PORT: Number(getOr('PORT', '3000')),
  BASE_URL: getOr('BASE_URL', 'http://localhost:3000'),
  FRONTEND_URL: getOr('FRONTEND_URL', ''),
  // SMS — Kavenegar
  // Set SMS_MOCK_MODE=false in production and provide a real KAVENEGAR_API_KEY.
  KAVENEGAR_API_KEY: getOr('KAVENEGAR_API_KEY', ''),
  SMS_MOCK_MODE: getOr('SMS_MOCK_MODE', 'true') === 'true',

  // ─── Incident Alerts (Pushover) ─────────────────────────────────────────────
  // Set INCIDENT_ALERTS_ENABLED=true to activate the alert pipeline.
  // Keep INCIDENT_ALERTS_TEST_MODE=true while verifying — alerts are only
  // printed to the terminal; no Pushover calls are made.
  // Flip INCIDENT_ALERTS_TEST_MODE=false once you confirm the test endpoint works.
  INCIDENT_ALERTS_ENABLED:   getOr('INCIDENT_ALERTS_ENABLED',   'false') === 'true',
  INCIDENT_ALERTS_TEST_MODE: getOr('INCIDENT_ALERTS_TEST_MODE', 'true')  === 'true',
  PUSHOVER_USER_KEY:   getOr('PUSHOVER_USER_KEY',   ''),
  PUSHOVER_APP_TOKEN:  getOr('PUSHOVER_APP_TOKEN',  ''),
  INCIDENT_MIN_SEVERITY: getOr('INCIDENT_MIN_SEVERITY', 'CRITICAL') as 'INFO' | 'WARNING' | 'CRITICAL',
}
