import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface PinSessionData {
  staffUserId: string
  staffName: string
  role: 'admin' | 'attendant'
  shopId: string
  lastActivity?: number // timestamp of last interaction
}

// Rate limiting for PIN attempts
export interface PinRateLimitData {
  attempts: number
  lockedUntil: number | null
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'penguin_pin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 12, // 12 hours (shift duration)
  },
}

const rateLimitOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'penguin_pin_rl',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 30, // 30 min window
  },
}

// Idle timeout: 5 minutes
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

// Rate limit: max 5 attempts, then lock for 30s * attempt count
const MAX_ATTEMPTS = 5
const BASE_LOCKOUT_SECONDS = 30

export async function getPinSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<PinSessionData>(cookieStore, sessionOptions)

  // Check idle timeout
  if (session.staffUserId && session.lastActivity) {
    const idleMs = Date.now() - session.lastActivity
    if (idleMs > IDLE_TIMEOUT_MS) {
      session.destroy()
      return session
    }
  }

  return session
}

export async function setPinSession(data: PinSessionData) {
  const session = await getPinSession()
  session.staffUserId = data.staffUserId
  session.staffName = data.staffName
  session.role = data.role
  session.shopId = data.shopId
  session.lastActivity = Date.now()
  await session.save()
}

export async function touchSession() {
  const session = await getPinSession()
  if (session.staffUserId) {
    session.lastActivity = Date.now()
    await session.save()
  }
}

export async function clearPinSession() {
  const session = await getPinSession()
  session.destroy()
}

// --- Rate limiting ---

export async function checkPinRateLimit(): Promise<
  { allowed: true } | { allowed: false; retryAfterSeconds: number }
> {
  const cookieStore = await cookies()
  const rl = await getIronSession<PinRateLimitData>(cookieStore, rateLimitOptions)

  if (rl.lockedUntil && Date.now() < rl.lockedUntil) {
    const retryAfterSeconds = Math.ceil((rl.lockedUntil - Date.now()) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  // Reset if lock has expired
  if (rl.lockedUntil && Date.now() >= rl.lockedUntil) {
    rl.attempts = 0
    rl.lockedUntil = null
    await rl.save()
  }

  return { allowed: true }
}

export async function recordPinAttempt(success: boolean) {
  const cookieStore = await cookies()
  const rl = await getIronSession<PinRateLimitData>(cookieStore, rateLimitOptions)

  if (success) {
    rl.attempts = 0
    rl.lockedUntil = null
    await rl.save()
    return
  }

  rl.attempts = (rl.attempts ?? 0) + 1

  if (rl.attempts >= MAX_ATTEMPTS) {
    // Exponential backoff: 30s, 60s, 90s, 120s...
    const lockoutMs = BASE_LOCKOUT_SECONDS * Math.min(rl.attempts - MAX_ATTEMPTS + 1, 4) * 1000
    rl.lockedUntil = Date.now() + lockoutMs
  }

  await rl.save()
}
