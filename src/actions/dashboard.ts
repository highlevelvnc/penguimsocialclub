'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getDailySummary } from './close'

export interface DashboardData {
  // Today
  todayRevenue: number
  todayTransactions: number
  todayCannabis: number
  todayMembers: number

  // This month
  monthRevenue: number
  monthTransactions: number

  // Members
  totalActiveMembers: number
  totalExpiredMembers: number
  expiringSoonCount: number

  // Expiring memberships
  expiringMembers: {
    id: string
    full_name: string
    membership_end: string
    days_left: number
  }[]

  // Stock alerts
  lowStockProducts: {
    id: string
    name: string
    stock_quantity: number
    low_stock_threshold: number
    unit_type: 'gram' | 'unit'
  }[]

  // Top products (this month)
  topProducts: {
    product_name: string
    total_revenue: number
    total_quantity: number
  }[]

  // Recent transactions
  recentTransactions: {
    id: string
    member_name: string
    total_amount: number
    cannabis_grams_total: number
    payment_method: 'cash' | 'card'
    item_count: number
    created_at: string
  }[]
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function monthStartISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function thirtyDaysFromNow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient()
  const today = todayISO()
  const monthStart = monthStartISO()
  const soon = thirtyDaysFromNow()

  const [
    todaySummary,
    monthRevenueResult,
    activeMembersResult,
    expiredMembersResult,
    expiringSoonResult,
    expiringMembersResult,
    lowStockResult,
    topProductsResult,
    recentTxnResult,
  ] = await Promise.all([
    // 1. Today summary (reuses existing RPC)
    getDailySummary(today),

    // 2. Month revenue + count
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('shop_id', SHOP_ID)
      .gte('created_at', `${monthStart}T00:00:00`),

    // 3. Active members count
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .eq('status', 'active')
      .gte('membership_end', today),

    // 4. Expired members count
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .or(`status.eq.expired,membership_end.lt.${today}`),

    // 5. Expiring in next 30 days
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', SHOP_ID)
      .eq('status', 'active')
      .gte('membership_end', today)
      .lte('membership_end', soon),

    // 6. Expiring members (next 30 days with names)
    supabase
      .from('members')
      .select('id, full_name, membership_end')
      .eq('shop_id', SHOP_ID)
      .eq('status', 'active')
      .gte('membership_end', today)
      .lte('membership_end', soon)
      .order('membership_end'),

    // 7. Low stock products
    supabase
      .from('products')
      .select('id, name, stock_quantity, low_stock_threshold, unit_type')
      .eq('shop_id', SHOP_ID)
      .eq('active', true)
      .filter('stock_quantity', 'lte', 'low_stock_threshold' as unknown as number)
      .order('stock_quantity'),

    // 7. Top products this month
    supabase
      .from('transaction_items')
      .select('product_name, line_total, quantity, transaction_id')
      .in(
        'transaction_id',
        // Subquery workaround: get transaction IDs for this month
        (
          await supabase
            .from('transactions')
            .select('id')
            .eq('shop_id', SHOP_ID)
            .gte('created_at', `${monthStart}T00:00:00`)
        ).data?.map((t: { id: string }) => t.id) ?? []
      ),

    // 8. Recent transactions with member name
    supabase
      .from('transactions')
      .select('id, total_amount, cannabis_grams_total, payment_method, item_count, created_at, member_id')
      .eq('shop_id', SHOP_ID)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Process month revenue
  const monthTxns = (monthRevenueResult.data as { total_amount: number }[] | null) ?? []
  const monthRevenue = monthTxns.reduce((sum, t) => sum + t.total_amount, 0)

  // Process low stock — filter in JS since Supabase can't compare two columns easily
  const allProducts = (lowStockResult.data as DashboardData['lowStockProducts'] | null) ?? []
  const lowStockProducts = allProducts.filter(p => p.stock_quantity <= p.low_stock_threshold)

  // Process top products — aggregate by product_name
  const topMap = new Map<string, { revenue: number; quantity: number }>()
  const items = (topProductsResult.data as { product_name: string; line_total: number; quantity: number }[] | null) ?? []
  for (const item of items) {
    const existing = topMap.get(item.product_name) ?? { revenue: 0, quantity: 0 }
    existing.revenue += item.line_total
    existing.quantity += item.quantity
    topMap.set(item.product_name, existing)
  }
  const topProducts = Array.from(topMap.entries())
    .map(([product_name, data]) => ({
      product_name,
      total_revenue: Math.round(data.revenue * 100) / 100,
      total_quantity: Math.round(data.quantity * 100) / 100,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5)

  // Process recent transactions — fetch member names
  const recentRaw = (recentTxnResult.data as (DashboardData['recentTransactions'][0] & { member_id: string })[] | null) ?? []
  const memberIds = [...new Set(recentRaw.map(t => t.member_id))]

  let memberNameMap = new Map<string, string>()
  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from('members')
      .select('id, full_name')
      .in('id', memberIds)

    for (const m of (members as { id: string; full_name: string }[] | null) ?? []) {
      memberNameMap.set(m.id, m.full_name)
    }
  }

  const recentTransactions = recentRaw.map(t => ({
    id: t.id,
    member_name: memberNameMap.get(t.member_id) ?? '—',
    total_amount: t.total_amount,
    cannabis_grams_total: t.cannabis_grams_total,
    payment_method: t.payment_method,
    item_count: t.item_count,
    created_at: t.created_at,
  }))

  return {
    todayRevenue: todaySummary.total_revenue,
    todayTransactions: todaySummary.total_transactions,
    todayCannabis: todaySummary.cannabis_grams_dispensed,
    todayMembers: todaySummary.unique_members_served,

    monthRevenue,
    monthTransactions: monthTxns.length,

    totalActiveMembers: activeMembersResult.count ?? 0,
    totalExpiredMembers: expiredMembersResult.count ?? 0,
    expiringSoonCount: expiringSoonResult.count ?? 0,

    expiringMembers: ((expiringMembersResult.data as { id: string; full_name: string; membership_end: string }[] | null) ?? [])
      .map(m => ({
        id: m.id,
        full_name: m.full_name,
        membership_end: m.membership_end,
        days_left: Math.ceil((new Date(m.membership_end).getTime() - Date.now()) / 86400000),
      })),

    lowStockProducts,
    topProducts,
    recentTransactions,
  }
}
