import type { Product } from '@/lib/supabase/types'

export interface MemberLimits {
  dailyLimit: number
  monthlyLimit: number
  dispensedToday: number
  dispensedMonth: number
}

export interface LimitCheck {
  allowed: boolean
  maxQuantity: number | null // max grams/units the member can still get of this product
  reason: 'daily' | 'monthly' | null
  remainingDaily: number
  remainingMonthly: number
}

/**
 * Check if adding a product at a given quantity would exceed limits.
 * Takes into account current cart cannabis grams already accumulated.
 */
export function checkLimit(
  limits: MemberLimits,
  cartCannabisGrams: number,
  product: Product,
  quantity: number
): LimitCheck {
  const remainingDaily = limits.dailyLimit - limits.dispensedToday - cartCannabisGrams
  const remainingMonthly = limits.monthlyLimit - limits.dispensedMonth - cartCannabisGrams

  // Accessories don't count
  if (!product.counts_toward_limit) {
    return { allowed: true, maxQuantity: null, reason: null, remainingDaily, remainingMonthly }
  }

  // Calculate how many cannabis grams this addition would add
  let addedGrams: number
  if (product.unit_type === 'gram') {
    addedGrams = quantity
  } else {
    addedGrams = quantity * (product.gram_equivalent ?? 0)
  }

  if (addedGrams > remainingDaily) {
    return {
      allowed: false,
      maxQuantity: computeMaxQuantity(remainingDaily, product),
      reason: 'daily',
      remainingDaily,
      remainingMonthly,
    }
  }

  if (addedGrams > remainingMonthly) {
    return {
      allowed: false,
      maxQuantity: computeMaxQuantity(remainingMonthly, product),
      reason: 'monthly',
      remainingDaily,
      remainingMonthly,
    }
  }

  return {
    allowed: true,
    maxQuantity: null,
    reason: null,
    remainingDaily: remainingDaily - addedGrams,
    remainingMonthly: remainingMonthly - addedGrams,
  }
}

/**
 * Get current remaining limits accounting for cart state.
 */
export function getRemainingLimits(
  limits: MemberLimits,
  cartCannabisGrams: number
): { daily: number; monthly: number } {
  return {
    daily: Math.max(0, Math.round((limits.dailyLimit - limits.dispensedToday - cartCannabisGrams) * 100) / 100),
    monthly: Math.max(0, Math.round((limits.monthlyLimit - limits.dispensedMonth - cartCannabisGrams) * 100) / 100),
  }
}

function computeMaxQuantity(remainingGrams: number, product: Product): number {
  if (remainingGrams <= 0) return 0
  if (product.unit_type === 'gram') {
    return Math.floor(remainingGrams * 10) / 10 // round down to 0.1g
  }
  const gramEq = product.gram_equivalent ?? 1
  return Math.floor(remainingGrams / gramEq) // whole units
}
