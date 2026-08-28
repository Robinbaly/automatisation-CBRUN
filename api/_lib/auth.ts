import { createHmac, timingSafeEqual } from 'node:crypto'
import type { ApiRequest, ApiResponse } from './http-types.js'

const COOKIE_NAME = 'cbrun_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days — internal tool, few users, on trusted devices

function secret(): string {
  const password = process.env.APP_PASSWORD
  if (!password) {
    throw new Error("Variable d'environnement APP_PASSWORD manquante sur le serveur.")
  }
  // Derive a signing key from the password so we only need one secret to configure.
  return createHmac('sha256', 'cbrun-stock-session').update(password).digest('hex')
}

function sign(expiry: number): string {
  const mac = createHmac('sha256', secret()).update(String(expiry)).digest('hex')
  return `${expiry}.${mac}`
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD || ''
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function makeSessionCookie(): string {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000
  const value = sign(expiry)
  const secure = process.env.NODE_ENV !== 'development'
  return [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    `Max-Age=${MAX_AGE_SECONDS}`,
  ]
    .filter(Boolean)
    .join('; ')
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function isAuthenticated(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
  if (!match) return false

  const value = match.slice(COOKIE_NAME.length + 1)
  const [expiryStr, mac] = value.split('.')
  const expiry = Number(expiryStr)
  if (!expiry || !mac || Date.now() > expiry) return false

  const expectedMac = createHmac('sha256', secret()).update(String(expiry)).digest('hex')
  const a = Buffer.from(mac)
  const b = Buffer.from(expectedMac)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Returns true and does nothing further when authenticated; otherwise sends 401 and returns false. */
export function requireAuth(req: ApiRequest, res: ApiResponse): boolean {
  if (isAuthenticated(cookieHeader(req))) return true
  res.status(401).json({ error: 'Session expirée, merci de te reconnecter.' })
  return false
}

export function cookieHeader(req: ApiRequest): string | undefined {
  const c = req.headers.cookie
  return typeof c === 'string' ? c : undefined
}
