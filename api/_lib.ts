import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { neon } from '@neondatabase/serverless'
import { parseCookie, stringifySetCookie } from 'cookie'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const scrypt = promisify(scryptCallback)
const COOKIE = 'sitedesk_session'
const SESSION_SECONDS = 60 * 60 * 24 * 14

export type Role = 'customer' | 'office' | 'technician' | 'admin'
export type Session = { tenantId: string; userId: string; role: Role; email: string; fullName: string }

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>
let cachedSql: Sql | null = null

export function sql(): Sql {
  if (cachedSql) return cachedSql
  if (!process.env.DATABASE_URL) throw new Error('SERVICE_NOT_CONFIGURED')
  cachedSql = neon(process.env.DATABASE_URL) as Sql
  return cachedSql
}

export function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export async function hashPassword(password: string) {
  if (password.length < 10 || password.length > 200) throw new Error('PASSWORD_POLICY')
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [method, saltHex, hashHex] = stored.split('$')
  if (method !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = (await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)) as Buffer
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function requireSameOrigin(req: VercelRequest) {
  if (req.method === 'GET') return
  const origin = req.headers.origin
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (!origin || !host) throw new Error('INVALID_ORIGIN')
  if (new URL(origin).host !== host) throw new Error('INVALID_ORIGIN')
}

export async function getSession(req: VercelRequest): Promise<Session | null> {
  const raw = parseCookie(req.headers.cookie || '')[COOKIE]
  if (!raw) return null
  const rows = await sql()`
    select s.tenant_id, s.user_id, u.role, u.email, u.full_name
    from sd_sessions s
    join sd_users u on u.id = s.user_id and u.tenant_id = s.tenant_id
    join sd_tenants t on t.id = s.tenant_id
    where s.token_hash = ${hash(raw)} and s.expires_at > now()
      and u.is_active = true and t.status = 'active'
    limit 1`
  const row = rows[0]
  if (!row) return null
  return { tenantId: String(row.tenant_id), userId: String(row.user_id), role: row.role as Role, email: String(row.email), fullName: String(row.full_name) }
}

export async function createSession(res: VercelResponse, tenantId: string, userId: string) {
  const raw = randomBytes(32).toString('base64url')
  await sql()`insert into sd_sessions (tenant_id, user_id, token_hash, expires_at)
    values (${tenantId}, ${userId}, ${hash(raw)}, now() + interval '14 days')`
  res.setHeader('Set-Cookie', stringifySetCookie({ name: COOKIE, value: raw,
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
  }))
}

export async function destroySession(req: VercelRequest, res: VercelResponse) {
  const raw = parseCookie(req.headers.cookie || '')[COOKIE]
  if (raw) await sql()`delete from sd_sessions where token_hash = ${hash(raw)}`
  res.setHeader('Set-Cookie', stringifySetCookie({ name: COOKIE, value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 }))
}

export function requireRole(session: Session, roles: Role[]) {
  if (!roles.includes(session.role)) throw new Error('FORBIDDEN')
}

export function body(req: VercelRequest): Record<string, unknown> {
  return typeof req.body === 'object' && req.body ? req.body as Record<string, unknown> : {}
}

export function textField(input: Record<string, unknown>, key: string, max = 500) {
  const value = typeof input[key] === 'string' ? input[key].trim() : ''
  if (!value || value.length > max) throw new Error('INVALID_INPUT')
  return value
}

export function handleError(res: VercelResponse, error: unknown) {
  const code = error instanceof Error ? error.message : 'UNKNOWN'
  const known: Record<string, [number, string]> = {
    SERVICE_NOT_CONFIGURED: [503, 'SiteDesk secure services are not configured.'],
    UNAUTHORIZED: [401, 'Sign in is required.'], FORBIDDEN: [403, 'You do not have access to this action.'],
    INVALID_ORIGIN: [403, 'Request origin was rejected.'], INVALID_INPUT: [400, 'Please check the submitted fields.'],
    PASSWORD_POLICY: [400, 'Passwords must be at least 10 characters.'], RATE_LIMITED: [429, 'Too many sign-in attempts. Try again later.'],
    BOOTSTRAP_DISABLED: [403, 'Initial setup is not available.'], ALREADY_BOOTSTRAPPED: [409, 'SiteDesk has already been initialized.'],
  }
  const [status, message] = known[code] || [500, 'SiteDesk could not complete that request.']
  if (status === 500) console.error('[sitedesk-api]', error instanceof Error ? error.message : 'unknown error')
  return res.status(status).json({ error: message, code: code.toLowerCase() })
}
