'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getPinSession } from '@/lib/session'

// --- Types ---

export interface ActiveCheckIn {
  id: string
  member_id: string
  member_name: string
  member_document: string
  checked_in_at: string
  checked_in_by_name: string
}

export interface CheckInHistoryItem {
  id: string
  checked_in_at: string
  checked_out_at: string | null
  duration_minutes: number | null
}

// --- Actions ---

/**
 * Check in a member. If already checked in, returns the existing check-in.
 */
export async function checkInMember(
  memberId: string
): Promise<{ success: true; checkInId: string; alreadyCheckedIn: boolean } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  const supabase = createAdminClient()

  // Check if already checked in (no checkout yet)
  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('shop_id', SHOP_ID)
    .eq('member_id', memberId)
    .is('checked_out_at', null)
    .limit(1)

  const existingRows = existing as { id: string }[] | null
  if (existingRows && existingRows.length > 0) {
    return { success: true, checkInId: existingRows[0].id, alreadyCheckedIn: true }
  }

  // Verify member age (must be 18+)
  const { data: memberData } = await supabase
    .from('members')
    .select('date_of_birth, status, membership_end')
    .eq('id', memberId)
    .eq('shop_id', SHOP_ID)
    .single()

  if (!memberData) {
    return { success: false, error: 'MEMBER_NOT_FOUND' }
  }

  const member = memberData as { date_of_birth: string; status: string; membership_end: string }

  // Age check
  const dob = new Date(member.date_of_birth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  if (age < 18) {
    return { success: false, error: 'UNDERAGE' }
  }

  // Status check
  if (member.status !== 'active') {
    return { success: false, error: 'MEMBER_NOT_ACTIVE' }
  }

  if (new Date(member.membership_end) < today) {
    return { success: false, error: 'MEMBERSHIP_EXPIRED' }
  }

  // Enforce max capacity
  const { count } = await supabase
    .from('check_ins')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', SHOP_ID)
    .is('checked_out_at', null)

  const { data: shopData } = await supabase
    .from('shops')
    .select('max_capacity')
    .eq('id', SHOP_ID)
    .single()

  const currentOccupancy = count ?? 0
  const maxCapacity = (shopData as { max_capacity: number } | null)?.max_capacity ?? 50

  if (currentOccupancy >= maxCapacity) {
    return { success: false, error: 'CAPACITY_FULL' }
  }

  // Create new check-in
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      shop_id: SHOP_ID,
      member_id: memberId,
      checked_in_by: session.staffUserId,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Failed to check in' }
  }

  return { success: true, checkInId: (data as { id: string }).id, alreadyCheckedIn: false }
}

/**
 * Check out a member (set checked_out_at = now)
 */
export async function checkOutMember(
  memberId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('check_ins')
    .update({ checked_out_at: new Date().toISOString() })
    .eq('shop_id', SHOP_ID)
    .eq('member_id', memberId)
    .is('checked_out_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get all currently checked-in members (for admin occupancy view)
 */
export async function getActiveCheckIns(): Promise<ActiveCheckIn[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('check_ins')
    .select('id, member_id, checked_in_at, checked_in_by')
    .eq('shop_id', SHOP_ID)
    .is('checked_out_at', null)
    .order('checked_in_at', { ascending: false })

  const rows = (data as { id: string; member_id: string; checked_in_at: string; checked_in_by: string }[] | null) ?? []

  if (rows.length === 0) return []

  // Fetch member + staff names
  const memberIds = [...new Set(rows.map((r) => r.member_id))]
  const staffIds = [...new Set(rows.map((r) => r.checked_in_by))]

  const [membersResult, staffResult] = await Promise.all([
    supabase
      .from('members')
      .select('id, full_name, document_number')
      .in('id', memberIds),
    supabase
      .from('staff_users')
      .select('id, full_name')
      .in('id', staffIds),
  ])

  const memberMap = new Map(
    ((membersResult.data as { id: string; full_name: string; document_number: string }[] | null) ?? [])
      .map((m) => [m.id, { name: m.full_name, doc: m.document_number }])
  )
  const staffMap = new Map(
    ((staffResult.data as { id: string; full_name: string }[] | null) ?? [])
      .map((s) => [s.id, s.full_name])
  )

  return rows.map((r) => ({
    id: r.id,
    member_id: r.member_id,
    member_name: memberMap.get(r.member_id)?.name ?? '—',
    member_document: memberMap.get(r.member_id)?.doc ?? '—',
    checked_in_at: r.checked_in_at,
    checked_in_by_name: staffMap.get(r.checked_in_by) ?? '—',
  }))
}

/**
 * Get current occupancy count
 */
export async function getOccupancyCount(): Promise<{ current: number; max: number }> {
  const supabase = createAdminClient()

  const [countResult, shopResult] = await Promise.all([
    supabase
      .from('check_ins')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .is('checked_out_at', null),
    supabase
      .from('shops')
      .select('max_capacity')
      .eq('id', SHOP_ID)
      .single(),
  ])

  return {
    current: countResult.count ?? 0,
    max: (shopResult.data as { max_capacity: number } | null)?.max_capacity ?? 50,
  }
}

/**
 * Check out all members (end of day)
 */
export async function checkOutAll(): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  const supabase = createAdminClient()

  // Get count first
  const { count } = await supabase
    .from('check_ins')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', SHOP_ID)
    .is('checked_out_at', null)

  // Check out all
  const { error } = await supabase
    .from('check_ins')
    .update({ checked_out_at: new Date().toISOString() })
    .eq('shop_id', SHOP_ID)
    .is('checked_out_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, count: count ?? 0 }
}

/**
 * Get today's check-in count for dashboard
 */
export async function getTodayCheckInCount(): Promise<number> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('check_ins')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', SHOP_ID)
    .gte('checked_in_at', `${today}T00:00:00`)

  return count ?? 0
}
