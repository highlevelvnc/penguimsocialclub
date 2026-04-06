'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  const headerLine = headers.map(escapeCSV).join(',')
  const dataLines = rows.map(row => row.map(escapeCSV).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export async function exportMembersCSV(): Promise<string> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('members')
    .select('full_name, document_type, document_number, date_of_birth, phone, email, membership_start, membership_end, status, daily_limit_grams, monthly_limit_grams, loyalty_points, created_at')
    .eq('shop_id', SHOP_ID)
    .order('full_name')

  const members = (data as {
    full_name: string; document_type: string; document_number: string; date_of_birth: string;
    phone: string | null; email: string | null; membership_start: string; membership_end: string;
    status: string; daily_limit_grams: number; monthly_limit_grams: number; loyalty_points: number; created_at: string
  }[] | null) ?? []

  return toCSV(
    ['Name', 'Doc Type', 'Doc Number', 'Birth Date', 'Phone', 'Email', 'Start', 'End', 'Status', 'Daily Limit', 'Monthly Limit', 'Points', 'Created'],
    members.map(m => [m.full_name, m.document_type, m.document_number, m.date_of_birth, m.phone, m.email, m.membership_start, m.membership_end, m.status, m.daily_limit_grams, m.monthly_limit_grams, m.loyalty_points, m.created_at.split('T')[0]])
  )
}

export async function exportTransactionsCSV(yearMonth: string): Promise<string> {
  const supabase = createAdminClient()
  const [year, month] = yearMonth.split('-').map(Number)
  const startDate = `${yearMonth}-01T00:00:00`
  const endDate = month === 12
    ? `${year + 1}-01-01T00:00:00`
    : `${yearMonth.slice(0, 5)}${String(month + 1).padStart(2, '0')}-01T00:00:00`

  const { data: txns } = await supabase
    .from('transactions')
    .select('id, total_amount, cannabis_grams_total, payment_method, item_count, created_at, member_id')
    .eq('shop_id', SHOP_ID)
    .gte('created_at', startDate)
    .lt('created_at', endDate)
    .order('created_at')

  const transactions = (txns as { id: string; total_amount: number; cannabis_grams_total: number; payment_method: string; item_count: number; created_at: string; member_id: string }[] | null) ?? []

  // Fetch member names
  const memberIds = [...new Set(transactions.map(t => t.member_id))]
  let memberMap = new Map<string, string>()
  if (memberIds.length > 0) {
    const { data: members } = await supabase.from('members').select('id, full_name').in('id', memberIds)
    for (const m of ((members as { id: string; full_name: string }[] | null) ?? [])) {
      memberMap.set(m.id, m.full_name)
    }
  }

  return toCSV(
    ['Date', 'Time', 'Member', 'Amount (€)', 'Cannabis (g)', 'Payment', 'Items', 'Transaction ID'],
    transactions.map(t => {
      const d = new Date(t.created_at)
      return [
        d.toLocaleDateString('es-ES'), d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        memberMap.get(t.member_id) ?? '—', t.total_amount, t.cannabis_grams_total, t.payment_method, t.item_count, t.id
      ]
    })
  )
}

export async function exportProductsCSV(): Promise<string> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('products')
    .select('name, category, unit_type, price_per_unit, stock_quantity, low_stock_threshold, active')
    .eq('shop_id', SHOP_ID)
    .order('category')
    .order('name')

  const products = (data as { name: string; category: string; unit_type: string; price_per_unit: number; stock_quantity: number; low_stock_threshold: number; active: boolean }[] | null) ?? []

  return toCSV(
    ['Name', 'Category', 'Unit Type', 'Price (€)', 'Stock', 'Low Threshold', 'Active'],
    products.map(p => [p.name, p.category, p.unit_type, p.price_per_unit, p.stock_quantity, p.low_stock_threshold, p.active ? 'Yes' : 'No'])
  )
}
