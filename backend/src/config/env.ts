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
  // Publicly reachable backend URL — used to build absolute image URLs stored in the DB.
  // In production set this to your Render URL, e.g. https://your-app.onrender.com
  BASE_URL: getOr('BASE_URL', 'http://localhost:3000'),
  // Frontend origin allowed by CORS. In production set to your Vercel URL.
  FRONTEND_URL: getOr('FRONTEND_URL', ''),
}
