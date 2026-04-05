'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getPinSession } from '@/lib/session'
import type { DailyClose } from '@/lib/supabase/types'

export interface DailySummary {
  total_transactions: number
  total_revenue: number
  cash_total: number
  card_total: number
  cannabis_grams_dispensed: number
  unique_members_served: number
}

export interface CloseInput {
  actual_cash: number
  notes: string | null
}

export async function getDailySummary(date: string): Promise<DailySummary> {
  const supabase = createAdminClient()

  const { data } = await supabase.rpc('compute_daily_summary', {
    p_shop_id: SHOP_ID,
    p_date: date,
  })

  // The function returns a table (array of rows), take the first row
  const rows = data as DailySummary[] | null
  if (rows && rows.length > 0) {
    return rows[0]
  }

  return {
    total_transactions: 0,
    total_revenue: 0,
    cash_total: 0,
    card_total: 0,
    cannabis_grams_dispensed: 0,
    unique_members_served: 0,
  }
}

export async function isAlreadyClosed(date: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('daily_closes')
    .select('id')
    .eq('shop_id', SHOP_ID)
    .eq('close_date', date)
    .limit(1)

  return (data as { id: string }[] | null)?.length ? true : false
}

export async function closeDay(
  date: string,
  summary: DailySummary,
  input: CloseInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  const supabase = createAdminClient()

  // Double-check not already closed
  const alreadyClosed = await isAlreadyClosed(date)
  if (alreadyClosed) {
    return { success: false, error: 'ALREADY_CLOSED' }
  }

  const cashDifference = Math.round((input.actual_cash - summary.cash_total) * 100) / 100

  const { error } = await supabase
    .from('daily_closes')
    .insert({
      shop_id: SHOP_ID,
      close_date: date,
      total_transactions: summary.total_transactions,
      total_revenue: summary.total_revenue,
      cash_total: summary.cash_total,
      card_total: summary.card_total,
      cannabis_grams_dispensed: summary.cannabis_grams_dispensed,
      unique_members_served: summary.unique_members_served,
      expected_cash: summary.cash_total,
      actual_cash: input.actual_cash,
      cash_difference: cashDifference,
      notes: input.notes?.trim() || null,
      closed_by: session.staffUserId,
    })

  if (error) {
    // UNIQUE constraint violation = already closed
    if (error.code === '23505') {
      return { success: false, error: 'ALREADY_CLOSED' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/close')
  return { success: true }
}

export async function getCloseHistory(): Promise<DailyClose[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('daily_closes')
    .select('*')
    .eq('shop_id', SHOP_ID)
    .order('close_date', { ascending: false })
    .limit(30)

  return (data as DailyClose[] | null) ?? []
}
