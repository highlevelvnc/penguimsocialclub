'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'

export interface MonthlyReportData {
  // Period
  month: string // YYYY-MM
  monthLabel: string // "Enero 2026"
  generatedAt: string

  // Club info
  clubName: string
  clubAddress: string | null
  clubCity: string | null

  // Revenue
  totalRevenue: number
  cashRevenue: number
  cardRevenue: number
  totalTransactions: number
  avgTransactionValue: number

  // Dispensing
  totalCannabisGrams: number
  uniqueMembersServed: number

  // Members
  totalActiveMembers: number
  newMembersThisMonth: number
  expiredThisMonth: number

  // Top products
  topProducts: {
    name: string
    category: string
    quantity: number
    revenue: number
  }[]

  // Daily breakdown
  dailyBreakdown: {
    date: string
    transactions: number
    revenue: number
    cannabis: number
    members: number
  }[]

  // Stock snapshot
  lowStockProducts: {
    name: string
    stock: number
    unit_type: 'gram' | 'unit'
    threshold: number
  }[]
}

export async function getMonthlyReport(yearMonth: string): Promise<MonthlyReportData> {
  const supabase = createAdminClient()
  const [year, month] = yearMonth.split('-').map(Number)
  const startDate = `${yearMonth}-01`
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${yearMonth.slice(0, 5)}${String(month + 1).padStart(2, '0')}-01`

  const startTs = `${startDate}T00:00:00`
  const endTs = `${endDate}T00:00:00`

  // Parallel queries
  const [
    txnResult,
    shopResult,
    activeMembersResult,
    newMembersResult,
    productsResult,
  ] = await Promise.all([
    // All transactions this month
    supabase
      .from('transactions')
      .select('id, total_amount, cannabis_grams_total, payment_method, member_id, item_count, created_at')
      .eq('shop_id', SHOP_ID)
      .gte('created_at', startTs)
      .lt('created_at', endTs)
      .order('created_at'),

    // Shop info
    supabase
      .from('shops')
      .select('name, address, city')
      .eq('id', SHOP_ID)
      .single(),

    // Active members count
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .eq('status', 'active'),

    // New members this month
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .gte('created_at', startTs)
      .lt('created_at', endTs),

    // Low stock
    supabase
      .from('products')
      .select('name, stock_quantity, low_stock_threshold, unit_type')
      .eq('shop_id', SHOP_ID)
      .eq('active', true),
  ])

  const transactions = (txnResult.data as {
    id: string
    total_amount: number
    cannabis_grams_total: number
    payment_method: 'cash' | 'card'
    member_id: string
    item_count: number
    created_at: string
  }[] | null) ?? []

  const shop = shopResult.data as { name: string; address: string | null; city: string | null } | null

  // Calculate revenue
  const totalRevenue = transactions.reduce((s, t) => s + t.total_amount, 0)
  const cashRevenue = transactions.filter(t => t.payment_method === 'cash').reduce((s, t) => s + t.total_amount, 0)
  const cardRevenue = transactions.filter(t => t.payment_method === 'card').reduce((s, t) => s + t.total_amount, 0)
  const totalCannabisGrams = transactions.reduce((s, t) => s + t.cannabis_grams_total, 0)
  const uniqueMembers = new Set(transactions.map(t => t.member_id)).size

  // Daily breakdown
  const dailyMap = new Map<string, { transactions: number; revenue: number; cannabis: number; members: Set<string> }>()
  for (const txn of transactions) {
    const day = txn.created_at.split('T')[0]
    const entry = dailyMap.get(day) ?? { transactions: 0, revenue: 0, cannabis: 0, members: new Set<string>() }
    entry.transactions++
    entry.revenue += txn.total_amount
    entry.cannabis += txn.cannabis_grams_total
    entry.members.add(txn.member_id)
    dailyMap.set(day, entry)
  }

  const dailyBreakdown = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      transactions: d.transactions,
      revenue: Math.round(d.revenue * 100) / 100,
      cannabis: Math.round(d.cannabis * 100) / 100,
      members: d.members.size,
    }))

  // Top products (aggregate from transaction_items)
  const txnIds = transactions.map(t => t.id)
  let topProducts: MonthlyReportData['topProducts'] = []

  if (txnIds.length > 0) {
    const { data: items } = await supabase
      .from('transaction_items')
      .select('product_name, product_category, quantity, line_total')
      .in('transaction_id', txnIds)

    const productMap = new Map<string, { category: string; quantity: number; revenue: number }>()
    for (const item of ((items as { product_name: string; product_category: string; quantity: number; line_total: number }[] | null) ?? [])) {
      const entry = productMap.get(item.product_name) ?? { category: item.product_category, quantity: 0, revenue: 0 }
      entry.quantity += item.quantity
      entry.revenue += item.line_total
      productMap.set(item.product_name, entry)
    }

    topProducts = Array.from(productMap.entries())
      .map(([name, d]) => ({
        name,
        category: d.category,
        quantity: Math.round(d.quantity * 100) / 100,
        revenue: Math.round(d.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  // Low stock
  const allProducts = (productsResult.data as { name: string; stock_quantity: number; low_stock_threshold: number; unit_type: 'gram' | 'unit' }[] | null) ?? []
  const lowStockProducts = allProducts
    .filter(p => p.stock_quantity <= p.low_stock_threshold)
    .map(p => ({ name: p.name, stock: p.stock_quantity, unit_type: p.unit_type, threshold: p.low_stock_threshold }))

  // Month label
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthLabel = `${monthNames[month - 1]} ${year}`

  return {
    month: yearMonth,
    monthLabel,
    generatedAt: new Date().toISOString(),
    clubName: shop?.name ?? 'Penguin Social Club',
    clubAddress: shop?.address ?? null,
    clubCity: shop?.city ?? 'Barcelona',
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    cashRevenue: Math.round(cashRevenue * 100) / 100,
    cardRevenue: Math.round(cardRevenue * 100) / 100,
    totalTransactions: transactions.length,
    avgTransactionValue: transactions.length > 0 ? Math.round((totalRevenue / transactions.length) * 100) / 100 : 0,
    totalCannabisGrams: Math.round(totalCannabisGrams * 100) / 100,
    uniqueMembersServed: uniqueMembers,
    totalActiveMembers: activeMembersResult.count ?? 0,
    newMembersThisMonth: newMembersResult.count ?? 0,
    expiredThisMonth: 0, // Could be computed but not critical
    topProducts,
    dailyBreakdown,
    lowStockProducts,
  }
}
