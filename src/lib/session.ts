import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface PinSessionData {
  staffUserId: string
  staffName: string
  role: 'admin' | 'attendant'
  shopId: string
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

export async function getPinSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<PinSessionData>(cookieStore, sessionOptions)
  return session
}

export async function setPinSession(data: PinSessionData) {
  const session = await getPinSession()
  session.staffUserId = data.staffUserId
  session.staffName = data.staffName
  session.role = data.role
  session.shopId = data.shopId
  await session.save()
}

export async function clearPinSession() {
  const session = await getPinSession()
  session.destroy()
}
