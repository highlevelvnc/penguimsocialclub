'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import type { Member, Transaction } from '@/lib/supabase/types'
import { logAudit } from './audit'

export interface MemberFormData {
  full_name: string
  document_type: 'dni' | 'nie' | 'passport'
  document_number: string
  document_expiry: string | null
  date_of_birth: string
  phone: string | null
  email: string | null
  membership_start: string
  membership_end: string
  daily_limit_grams: number
  monthly_limit_grams: number
  status: 'active' | 'expired' | 'suspended'
  notes: string | null
}

export type MemberTransaction = Pick<
  Transaction,
  'id' | 'total_amount' | 'cannabis_grams_total' | 'payment_method' | 'item_count' | 'created_at'
>

// --- Validation helpers ---

function isAtLeast18(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 18
}

// --- CRUD ---

export async function createMember(data: MemberFormData): Promise<
  { success: true; id: string } | { success: false; error: string }
> {
  if (!isAtLeast18(data.date_of_birth)) {
    return { success: false, error: 'UNDERAGE' }
  }

  const supabase = createAdminClient()

  // Check document uniqueness within shop
  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('shop_id', SHOP_ID)
    .eq('document_number', data.document_number.trim())
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: false, error: 'DUPLICATE_DOCUMENT' }
  }

  const { data: member, error } = await supabase
    .from('members')
    .insert({
      shop_id: SHOP_ID,
      full_name: data.full_name.trim(),
      document_type: data.document_type,
      document_number: data.document_number.trim().toUpperCase(),
      document_expiry: data.document_expiry || null,
      date_of_birth: data.date_of_birth,
      phone: data.phone?.trim() || null,
      email: data.email?.trim().toLowerCase() || null,
      membership_start: data.membership_start,
      membership_end: data.membership_end,
      daily_limit_grams: data.daily_limit_grams,
      monthly_limit_grams: data.monthly_limit_grams,
      status: data.status,
      notes: data.notes?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !member) {
    return { success: false, error: error?.message ?? 'Failed to create member' }
  }

  revalidatePath('/[locale]/admin/members')
  logAudit({ action: 'member.create', entityType: 'member', entityId: (member as { id: string }).id, details: data.full_name })
  return { success: true, id: (member as { id: string }).id }
}

export async function updateMember(id: string, data: MemberFormData): Promise<
  { success: true } | { success: false; error: string }
> {
  if (!isAtLeast18(data.date_of_birth)) {
    return { success: false, error: 'UNDERAGE' }
  }

  const supabase = createAdminClient()

  // Check document uniqueness (exclude self)
  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('shop_id', SHOP_ID)
    .eq('document_number', data.document_number.trim())
    .neq('id', id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: false, error: 'DUPLICATE_DOCUMENT' }
  }

  const { error } = await supabase
    .from('members')
    .update({
      full_name: data.full_name.trim(),
      document_type: data.document_type,
      document_number: data.document_number.trim().toUpperCase(),
      document_expiry: data.document_expiry || null,
      date_of_birth: data.date_of_birth,
      phone: data.phone?.trim() || null,
      email: data.email?.trim().toLowerCase() || null,
      membership_end: data.membership_end,
      daily_limit_grams: data.daily_limit_grams,
      monthly_limit_grams: data.monthly_limit_grams,
      status: data.status,
      notes: data.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('shop_id', SHOP_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/members')
  revalidatePath(`/[locale]/admin/members/${id}`)
  return { success: true }
}

export async function renewMembership(id: string, newEndDate: string): Promise<
  { success: true } | { success: false; error: string }
> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('members')
    .update({
      membership_end: newEndDate,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('shop_id', SHOP_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/members')
  revalidatePath(`/[locale]/admin/members/${id}`)
  return { success: true }
}

// --- Reads ---

export async function getMember(id: string): Promise<Member | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .eq('shop_id', SHOP_ID)
    .single()

  return (data as Member | null) ?? null
}

export async function getMembers(opts?: {
  search?: string
  status?: 'active' | 'expired' | 'suspended'
}): Promise<Member[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('members')
    .select('*')
    .eq('shop_id', SHOP_ID)
    .order('full_name')

  if (opts?.status) {
    query = query.eq('status', opts.status)
  }

  if (opts?.search && opts.search.length >= 2) {
    // Search by name or document number (case-insensitive prefix)
    query = query.or(
      `full_name.ilike.%${opts.search}%,document_number.ilike.${opts.search}%`
    )
  }

  const { data } = await query
  return (data as Member[] | null) ?? []
}

export async function getMemberTransactions(memberId: string): Promise<MemberTransaction[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('transactions')
    .select('id, total_amount, cannabis_grams_total, payment_method, item_count, created_at')
    .eq('member_id', memberId)
    .eq('shop_id', SHOP_ID)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data as MemberTransaction[] | null) ?? []
}

export async function getMemberDispensingTotals(memberId: string): Promise<{
  today: number
  month: number
}> {
  const supabase = createAdminClient()

  const [todayResult, monthResult] = await Promise.all([
    supabase.rpc('get_member_dispensed_today', {
      p_member_id: memberId,
      p_shop_id: SHOP_ID,
    }),
    supabase.rpc('get_member_dispensed_month', {
      p_member_id: memberId,
      p_shop_id: SHOP_ID,
    }),
  ])

  return {
    today: (todayResult.data as number) ?? 0,
    month: (monthResult.data as number) ?? 0,
  }
}
