'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getPinSession, touchSession } from '@/lib/session'
import type { CartItem } from '@/lib/pos/cart'
import { logAudit } from './audit'

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
  | { success: true; transactionId: string; pointsEarned: number }
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

  // Touch session (reset idle timer)
  await touchSession()

  const supabase = createAdminClient()

  // 2. Server-side recalculation of totals (never trust client)
  let cannabisGramsTotal = 0
  let totalAmount = 0

  for (const item of input.items) {
    totalAmount += item.lineTotal
    cannabisGramsTotal += item.cannabisGrams
  }

  cannabisGramsTotal = Math.round(cannabisGramsTotal * 100) / 100
  totalAmount = Math.round(totalAmount * 100) / 100

  // 3. Build items payload for the DB function
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

  // 4. Execute atomic checkout (DB handles: limits, stock, loyalty — all in one transaction)
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
    const msg = error.message ?? ''

    if (msg.includes('Member not found') || msg.includes('Member not active')) {
      return { success: false, error: 'MEMBER_NOT_ACTIVE' }
    }
    if (msg.includes('Membership expired')) {
      return { success: false, error: 'MEMBERSHIP_EXPIRED' }
    }
    if (msg.includes('Daily limit exceeded')) {
      const match = msg.match(/Remaining: ([\d.]+)/)
      return {
        success: false,
        error: 'DAILY_LIMIT_EXCEEDED',
        remaining: match ? parseFloat(match[1]) : 0,
      }
    }
    if (msg.includes('Monthly limit exceeded')) {
      const match = msg.match(/Remaining: ([\d.]+)/)
      return {
        success: false,
        error: 'MONTHLY_LIMIT_EXCEEDED',
        remaining: match ? parseFloat(match[1]) : 0,
      }
    }
    if (msg.includes('Insufficient stock')) {
      return { success: false, error: 'INSUFFICIENT_STOCK', details: msg }
    }

    return { success: false, error: 'CHECKOUT_FAILED', details: msg }
  }

  // Calculate points earned for the UI (same formula as DB)
  const pointsEarned = Math.floor(totalAmount)

  // Audit
  logAudit({
    action: 'checkout',
    entityType: 'transaction',
    entityId: data as string,
    details: `€${totalAmount.toFixed(2)} (${input.paymentMethod}) — ${cannabisGramsTotal}g cannabis`,
  })

  return { success: true, transactionId: data as string, pointsEarned }
}
