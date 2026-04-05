'use server'

import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { setPinSession, clearPinSession } from '@/lib/session'
import { SHOP_ID } from '@/lib/constants'

interface StaffRow {
  id: string
  full_name: string
  pin_hash: string
  role: 'admin' | 'attendant'
}

export async function validatePin(pin: string): Promise<
  | { success: true; staffName: string; role: 'admin' | 'attendant' }
  | { success: false; error: string }
> {
  if (!pin || pin.length < 4 || pin.length > 6) {
    return { success: false, error: 'INVALID_PIN' }
  }

  const supabase = createAdminClient()

  const { data: staffUsers } = await supabase
    .from('staff_users')
    .select('id, full_name, pin_hash, role')
    .eq('shop_id', SHOP_ID)
    .eq('active', true)

  const staff = (staffUsers as StaffRow[] | null) ?? []

  if (staff.length === 0) {
    return { success: false, error: 'NO_STAFF' }
  }

  for (const s of staff) {
    const match = await bcrypt.compare(pin, s.pin_hash)
    if (match) {
      await setPinSession({
        staffUserId: s.id,
        staffName: s.full_name,
        role: s.role,
        shopId: SHOP_ID,
      })
      return { success: true, staffName: s.full_name, role: s.role }
    }
  }

  return { success: false, error: 'INVALID_PIN' }
}

export async function lockPos() {
  await clearPinSession()
}
