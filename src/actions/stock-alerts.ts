'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'

export interface StockAlert {
  id: string
  name: string
  category: string
  unit_type: 'gram' | 'unit'
  stock_quantity: number
  low_stock_threshold: number
  avgDailySales: number
  daysUntilStockout: number | null // null = no recent sales data
}

/**
 * Get products with low stock + estimated days until stockout
 * based on the last 30 days of sales velocity.
 */
export async function getStockAlerts(): Promise<StockAlert[]> {
  const supabase = createAdminClient()

  // 1. Get all active products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, unit_type, stock_quantity, low_stock_threshold')
    .eq('shop_id', SHOP_ID)
    .eq('active', true)
    .order('stock_quantity')

  const allProducts = (products as {
    id: string
    name: string
    category: string
    unit_type: 'gram' | 'unit'
    stock_quantity: number
    low_stock_threshold: number
  }[] | null) ?? []

  // Only products at or below threshold (or out of stock)
  const lowStockProducts = allProducts.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  )

  if (lowStockProducts.length === 0) return []

  // 2. Get sales data for the last 30 days for these products
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString()

  const productIds = lowStockProducts.map((p) => p.id)

  // Get transaction IDs for the last 30 days
  const { data: recentTxns } = await supabase
    .from('transactions')
    .select('id')
    .eq('shop_id', SHOP_ID)
    .gte('created_at', since)

  const txnIds = ((recentTxns as { id: string }[] | null) ?? []).map((t) => t.id)

  // Get aggregated sales per product
  let salesMap = new Map<string, number>()

  if (txnIds.length > 0) {
    const { data: items } = await supabase
      .from('transaction_items')
      .select('product_id, quantity')
      .in('transaction_id', txnIds)
      .in('product_id', productIds)

    const salesItems = (items as { product_id: string; quantity: number }[] | null) ?? []

    for (const item of salesItems) {
      salesMap.set(
        item.product_id,
        (salesMap.get(item.product_id) ?? 0) + item.quantity
      )
    }
  }

  // 3. Calculate velocity and days until stockout
  const daysSince = Math.max(1, Math.ceil((Date.now() - thirtyDaysAgo.getTime()) / 86400000))

  return lowStockProducts.map((p) => {
    const totalSold = salesMap.get(p.id) ?? 0
    const avgDailySales = Math.round((totalSold / daysSince) * 100) / 100

    let daysUntilStockout: number | null = null
    if (avgDailySales > 0 && p.stock_quantity > 0) {
      daysUntilStockout = Math.floor(p.stock_quantity / avgDailySales)
    } else if (p.stock_quantity <= 0) {
      daysUntilStockout = 0
    }

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      unit_type: p.unit_type,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      avgDailySales,
      daysUntilStockout,
    }
  })
}

/**
 * Simple count of products below threshold — for sidebar badge
 */
export async function getLowStockCount(): Promise<number> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('products')
    .select('id, stock_quantity, low_stock_threshold')
    .eq('shop_id', SHOP_ID)
    .eq('active', true)

  const products = (data as { id: string; stock_quantity: number; low_stock_threshold: number }[] | null) ?? []
  return products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length
}
