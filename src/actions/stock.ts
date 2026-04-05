'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getPinSession } from '@/lib/session'
import type { StockAdjustment } from '@/lib/supabase/types'

export interface StockAdjustmentData {
  product_id: string
  adjustment_type: 'restock' | 'correction' | 'loss' | 'return'
  quantity: number
  reason: string | null
}

export type AdjustmentWithStaff = StockAdjustment & {
  staff_users: { full_name: string } | null
}

export async function createStockAdjustment(data: StockAdjustmentData): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getPinSession()
  const staffUserId = session.staffUserId

  if (!staffUserId) {
    return { success: false, error: 'Not authenticated' }
  }

  const supabase = createAdminClient()

  // Determine signed quantity
  let signedQuantity = data.quantity
  if (data.adjustment_type === 'loss') {
    signedQuantity = -Math.abs(data.quantity)
  } else if (data.adjustment_type === 'restock' || data.adjustment_type === 'return') {
    signedQuantity = Math.abs(data.quantity)
  }

  // Get current stock
  const { data: product } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', data.product_id)
    .single()

  if (!product) {
    return { success: false, error: 'Product not found' }
  }

  const currentStock = (product as { stock_quantity: number }).stock_quantity
  const newStock = currentStock + signedQuantity
  if (newStock < 0) {
    return { success: false, error: 'Insufficient stock for this adjustment' }
  }

  // Insert adjustment record
  const { error: adjError } = await supabase
    .from('stock_adjustments')
    .insert({
      shop_id: SHOP_ID,
      product_id: data.product_id,
      adjustment_type: data.adjustment_type,
      quantity: signedQuantity,
      reason: data.reason?.trim() || null,
      performed_by: staffUserId,
    })

  if (adjError) {
    return { success: false, error: adjError.message }
  }

  // Update product stock
  const { error: updateError } = await supabase
    .from('products')
    .update({
      stock_quantity: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.product_id)
    .eq('shop_id', SHOP_ID)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/[locale]/admin/products')
  revalidatePath(`/[locale]/admin/products/${data.product_id}`)
  return { success: true }
}

export async function getStockAdjustments(productId: string): Promise<AdjustmentWithStaff[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('stock_adjustments')
    .select('*, staff_users:performed_by(full_name)')
    .eq('product_id', productId)
    .eq('shop_id', SHOP_ID)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data as AdjustmentWithStaff[] | null) ?? []
}
