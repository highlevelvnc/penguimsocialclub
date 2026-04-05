'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getPinSession } from '@/lib/session'
import type { CartItem } from '@/lib/pos/cart'

interface CheckoutInput {
  shopId: string
  memberId: string
  paymentMethod: 'cash' | 'card'
  items: CartItem[]
}

type CheckoutError =
  | 'NOT_AUTHENTICATED'
  | 'EMPTY_CART'
  | 'MEMBER_NOT_ACTIVE'
  | 'MEMBERSHIP_EXPIRED'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'MONTHLY_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_STOCK'
  | 'CHECKOUT_FAILED'

type CheckoutResult =
  | { success: true; transactionId: string }
  | { success: false; error: CheckoutError; remaining?: number; details?: string }

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  // 1. Validate staff session
  const session = await getPinSession()
  if (!session.staffUserId) {
    return { success: false, error: 'NOT_AUTHENTICATED' }
  }

  if (input.items.length === 0) {
    return { success: false, error: 'EMPTY_CART' }
  }

  const supabase = createAdminClient()

  // 2. Validate member status
  const { data: member } = await supabase
    .from('members')
    .select('status, membership_end, daily_limit_grams, monthly_limit_grams')
    .eq('id', input.memberId)
    .eq('shop_id', input.shopId)
    .single()

  if (!member) {
    return { success: false, error: 'MEMBER_NOT_ACTIVE' }
  }

  const m = member as {
    status: string
    membership_end: string
    daily_limit_grams: number
    monthly_limit_grams: number
  }

  if (m.status !== 'active') {
    return { success: false, error: 'MEMBER_NOT_ACTIVE' }
  }

  if (new Date(m.membership_end) < new Date()) {
    return { success: false, error: 'MEMBERSHIP_EXPIRED' }
  }

  // 3. Server-side recalculation of cannabis grams
  // Never trust client-sent totals — recompute from items
  let cannabisGramsTotal = 0
  let totalAmount = 0

  for (const item of input.items) {
    totalAmount += item.lineTotal
    cannabisGramsTotal += item.cannabisGrams
  }

  cannabisGramsTotal = Math.round(cannabisGramsTotal * 100) / 100
  totalAmount = Math.round(totalAmount * 100) / 100

  // 4. Fetch current dispensing totals from DB
  const [todayRes, monthRes] = await Promise.all([
    supabase.rpc('get_member_dispensed_today', {
      p_member_id: input.memberId,
      p_shop_id: input.shopId,
    }),
    supabase.rpc('get_member_dispensed_month', {
      p_member_id: input.memberId,
      p_shop_id: input.shopId,
    }),
  ])

  const dispensedToday = (todayRes.data as number) ?? 0
  const dispensedMonth = (monthRes.data as number) ?? 0

  // 5. Enforce limits
  const remainingDaily = m.daily_limit_grams - dispensedToday
  if (cannabisGramsTotal > remainingDaily) {
    return {
      success: false,
      error: 'DAILY_LIMIT_EXCEEDED',
      remaining: Math.max(0, Math.round(remainingDaily * 100) / 100),
    }
  }

  const remainingMonthly = m.monthly_limit_grams - dispensedMonth
  if (cannabisGramsTotal > remainingMonthly) {
    return {
      success: false,
      error: 'MONTHLY_LIMIT_EXCEEDED',
      remaining: Math.max(0, Math.round(remainingMonthly * 100) / 100),
    }
  }

  // 6. Build items payload for the DB function
  const dbItems = input.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productCategory: item.productCategory,
    unitType: item.unitType,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    cannabisGrams: item.cannabisGrams,
  }))

  // 7. Execute atomic checkout
  const { data, error } = await supabase.rpc('execute_checkout', {
    p_shop_id: input.shopId,
    p_member_id: input.memberId,
    p_staff_user_id: session.staffUserId,
    p_payment_method: input.paymentMethod,
    p_total_amount: totalAmount,
    p_cannabis_grams_total: cannabisGramsTotal,
    p_item_count: input.items.length,
    p_items: JSON.stringify(dbItems),
  })

  if (error) {
    // The DB function raises 'Insufficient stock for product X'
    if (error.message?.includes('Insufficient stock')) {
      return { success: false, error: 'INSUFFICIENT_STOCK', details: error.message }
    }
    return { success: false, error: 'CHECKOUT_FAILED', details: error.message }
  }

  return { success: true, transactionId: data as string }
}
