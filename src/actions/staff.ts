'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import type { StaffUser } from '@/lib/supabase/types'

export interface StaffCreateData {
  full_name: string
  email: string | null
  role: 'admin' | 'attendant'
  pin: string
  active: boolean
}

export interface StaffUpdateData {
  full_name: string
  email: string | null
  role: 'admin' | 'attendant'
  pin: string | null // null = don't change
  active: boolean
}

export async function createStaffUser(data: StaffCreateData): Promise<
  { success: true; id: string } | { success: false; error: string }
> {
  if (!data.pin || data.pin.length < 4 || data.pin.length > 6) {
    return { success: false, error: 'PIN must be 4-6 digits' }
  }

  if (!/^\d{4,6}$/.test(data.pin)) {
    return { success: false, error: 'PIN must contain only digits' }
  }

  if (data.role === 'admin' && !data.email) {
    return { success: false, error: 'Email is required for admin users' }
  }

  const supabase = createAdminClient()

  // Check email uniqueness if provided
  if (data.email) {
    const { data: existing } = await supabase
      .from('staff_users')
      .select('id')
      .eq('email', data.email.trim().toLowerCase())
      .limit(1)

    if ((existing as { id: string }[] | null)?.length) {
      return { success: false, error: 'Email already in use' }
    }
  }

  // Check PIN uniqueness within shop (compare against all active staff)
  const pinHash = await bcrypt.hash(data.pin, 10)

  // We can't check PIN uniqueness by hash comparison easily,
  // but we can fetch all PINs and compare — necessary for small staff counts
  const { data: allStaff } = await supabase
    .from('staff_users')
    .select('pin_hash')
    .eq('shop_id', SHOP_ID)
    .eq('active', true)

  const staffList = (allStaff as { pin_hash: string }[] | null) ?? []
  for (const s of staffList) {
    if (await bcrypt.compare(data.pin, s.pin_hash)) {
      return { success: false, error: 'This PIN is already used by another staff member' }
    }
  }

  const { data: created, error } = await supabase
    .from('staff_users')
    .insert({
      shop_id: SHOP_ID,
      full_name: data.full_name.trim(),
      email: data.email?.trim().toLowerCase() || null,
      pin_hash: pinHash,
      role: data.role,
      active: data.active,
    })
    .select('id')
    .single()

  if (error || !created) {
    return { success: false, error: error?.message ?? 'Failed to create staff user' }
  }

  revalidatePath('/[locale]/admin/staff')
  return { success: true, id: (created as { id: string }).id }
}

export async function updateStaffUser(id: string, data: StaffUpdateData): Promise<
  { success: true } | { success: false; error: string }
> {
  if (data.role === 'admin' && !data.email) {
    return { success: false, error: 'Email is required for admin users' }
  }

  const supabase = createAdminClient()

  // Check email uniqueness if provided (exclude self)
  if (data.email) {
    const { data: existing } = await supabase
      .from('staff_users')
      .select('id')
      .eq('email', data.email.trim().toLowerCase())
      .neq('id', id)
      .limit(1)

    if ((existing as { id: string }[] | null)?.length) {
      return { success: false, error: 'Email already in use' }
    }
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    full_name: data.full_name.trim(),
    email: data.email?.trim().toLowerCase() || null,
    role: data.role,
    active: data.active,
    updated_at: new Date().toISOString(),
  }

  // If PIN is being changed, validate and hash
  if (data.pin) {
    if (data.pin.length < 4 || data.pin.length > 6 || !/^\d{4,6}$/.test(data.pin)) {
      return { success: false, error: 'PIN must be 4-6 digits' }
    }

    // Check PIN uniqueness (exclude self)
    const { data: allStaff } = await supabase
      .from('staff_users')
      .select('id, pin_hash')
      .eq('shop_id', SHOP_ID)
      .eq('active', true)
      .neq('id', id)

    const staffList = (allStaff as { id: string; pin_hash: string }[] | null) ?? []
    for (const s of staffList) {
      if (await bcrypt.compare(data.pin, s.pin_hash)) {
        return { success: false, error: 'This PIN is already used by another staff member' }
      }
    }

    updatePayload.pin_hash = await bcrypt.hash(data.pin, 10)
  }

  const { error } = await supabase
    .from('staff_users')
    .update(updatePayload)
    .eq('id', id)
    .eq('shop_id', SHOP_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/staff')
  return { success: true }
}

export async function toggleStaffActive(id: string, active: boolean): Promise<
  { success: true } | { success: false; error: string }
> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('staff_users')
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('shop_id', SHOP_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/staff')
  return { success: true }
}

export async function getStaffUsers(): Promise<StaffUser[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('staff_users')
    .select('*')
    .eq('shop_id', SHOP_ID)
    .order('active', { ascending: false })
    .order('full_name')

  return (data as StaffUser[] | null) ?? []
}

export async function getStaffUser(id: string): Promise<StaffUser | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('staff_users')
    .select('*')
    .eq('id', id)
    .eq('shop_id', SHOP_ID)
    .single()

  return (data as StaffUser | null) ?? null
}
