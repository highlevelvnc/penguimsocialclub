'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getPinSession } from '@/lib/session'

// --- Types ---

export interface LoyaltyConfig {
  pointsPerEuro: number // how many points per €1 spent
  euroPerPoint: number  // how much each point is worth in €
}

export interface LoyaltyEntry {
  id: string
  type: 'earn' | 'redeem' | 'adjust'
  points: number
  balance_after: number
  description: string | null
  created_at: string
  created_by_name: string
}

// --- Config ---

export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('shops')
    .select('loyalty_points_per_euro, loyalty_euro_per_point')
    .eq('id', SHOP_ID)
    .single()

  const shop = data as { loyalty_points_per_euro: number; loyalty_euro_per_point: number } | null

  return {
    pointsPerEuro: shop?.loyalty_points_per_euro ?? 1,
    euroPerPoint: shop?.loyalty_euro_per_point ?? 0.10,
  }
}

// --- Earn points (called after successful checkout) ---

export async function earnPoints(
  memberId: string,
  transactionId: string,
  totalAmount: number
): Promise<{ success: true; pointsEarned: number; newBalance: number } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  const supabase = createAdminClient()
  const config = await getLoyaltyConfig()

  const pointsEarned = Math.floor(totalAmount * config.pointsPerEuro)
  if (pointsEarned <= 0) {
    return { success: true, pointsEarned: 0, newBalance: 0 }
  }

  // Get current balance
  const { data: member } = await supabase
    .from('members')
    .select('loyalty_points')
    .eq('id', memberId)
    .single()

  const currentPoints = (member as { loyalty_points: number } | null)?.loyalty_points ?? 0
  const newBalance = currentPoints + pointsEarned

  // Update balance + create ledger entry atomically
  const [updateResult, ledgerResult] = await Promise.all([
    supabase
      .from('members')
      .update({ loyalty_points: newBalance })
      .eq('id', memberId),
    supabase
      .from('loyalty_ledger')
      .insert({
        shop_id: SHOP_ID,
        member_id: memberId,
        transaction_id: transactionId,
        type: 'earn' as const,
        points: pointsEarned,
        balance_after: newBalance,
        description: `+${pointsEarned} pts (\u20AC${totalAmount.toFixed(2)})`,
        created_by: session.staffUserId,
      }),
  ])

  if (updateResult.error || ledgerResult.error) {
    return { success: false, error: updateResult.error?.message ?? ledgerResult.error?.message ?? 'Failed' }
  }

  return { success: true, pointsEarned, newBalance }
}

// --- Redeem points (creates a discount) ---

export async function redeemPoints(
  memberId: string,
  pointsToRedeem: number
): Promise<{ success: true; discountAmount: number; newBalance: number } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  if (pointsToRedeem <= 0) {
    return { success: false, error: 'INVALID_AMOUNT' }
  }

  const supabase = createAdminClient()
  const config = await getLoyaltyConfig()

  // Get current balance
  const { data: member } = await supabase
    .from('members')
    .select('loyalty_points')
    .eq('id', memberId)
    .single()

  const currentPoints = (member as { loyalty_points: number } | null)?.loyalty_points ?? 0

  if (pointsToRedeem > currentPoints) {
    return { success: false, error: 'INSUFFICIENT_POINTS' }
  }

  const newBalance = currentPoints - pointsToRedeem
  const discountAmount = Math.round(pointsToRedeem * config.euroPerPoint * 100) / 100

  // Update balance + create ledger entry
  const [updateResult, ledgerResult] = await Promise.all([
    supabase
      .from('members')
      .update({ loyalty_points: newBalance })
      .eq('id', memberId),
    supabase
      .from('loyalty_ledger')
      .insert({
        shop_id: SHOP_ID,
        member_id: memberId,
        type: 'redeem' as const,
        points: -pointsToRedeem,
        balance_after: newBalance,
        description: `-${pointsToRedeem} pts = \u20AC${discountAmount.toFixed(2)} descuento`,
        created_by: session.staffUserId,
      }),
  ])

  if (updateResult.error || ledgerResult.error) {
    return { success: false, error: updateResult.error?.message ?? ledgerResult.error?.message ?? 'Failed' }
  }

  revalidatePath('/[locale]/admin/members')
  return { success: true, discountAmount, newBalance }
}

// --- Manual adjustment (admin) ---

export async function adjustPoints(
  memberId: string,
  points: number,
  reason: string
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  const supabase = createAdminClient()

  const { data: member } = await supabase
    .from('members')
    .select('loyalty_points')
    .eq('id', memberId)
    .single()

  const currentPoints = (member as { loyalty_points: number } | null)?.loyalty_points ?? 0
  const newBalance = Math.max(0, currentPoints + points)

  const [updateResult, ledgerResult] = await Promise.all([
    supabase
      .from('members')
      .update({ loyalty_points: newBalance })
      .eq('id', memberId),
    supabase
      .from('loyalty_ledger')
      .insert({
        shop_id: SHOP_ID,
        member_id: memberId,
        type: 'adjust' as const,
        points,
        balance_after: newBalance,
        description: reason || null,
        created_by: session.staffUserId,
      }),
  ])

  if (updateResult.error || ledgerResult.error) {
    return { success: false, error: updateResult.error?.message ?? ledgerResult.error?.message ?? 'Failed' }
  }

  revalidatePath(`/[locale]/admin/members/${memberId}`)
  return { success: true, newBalance }
}

// --- History (for admin member detail) ---

export async function getLoyaltyHistory(memberId: string): Promise<LoyaltyEntry[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('loyalty_ledger')
    .select('id, type, points, balance_after, description, created_at, created_by')
    .eq('member_id', memberId)
    .eq('shop_id', SHOP_ID)
    .order('created_at', { ascending: false })
    .limit(30)

  const rows = (data as {
    id: string
    type: 'earn' | 'redeem' | 'adjust'
    points: number
    balance_after: number
    description: string | null
    created_at: string
    created_by: string
  }[] | null) ?? []

  if (rows.length === 0) return []

  // Fetch staff names
  const staffIds = [...new Set(rows.map((r) => r.created_by))]
  const { data: staff } = await supabase
    .from('staff_users')
    .select('id, full_name')
    .in('id', staffIds)

  const staffMap = new Map(
    ((staff as { id: string; full_name: string }[] | null) ?? [])
      .map((s) => [s.id, s.full_name])
  )

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    points: r.points,
    balance_after: r.balance_after,
    description: r.description,
    created_at: r.created_at,
    created_by_name: staffMap.get(r.created_by) ?? '—',
  }))
}
