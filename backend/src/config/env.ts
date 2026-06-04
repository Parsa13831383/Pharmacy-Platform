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
}
