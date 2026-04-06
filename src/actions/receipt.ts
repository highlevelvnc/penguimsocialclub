'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'

export interface ReceiptData {
  // Transaction
  transactionId: string
  createdAt: string
  paymentMethod: 'cash' | 'card'
  totalAmount: number
  cannabisGramsTotal: number
  itemCount: number

  // Member
  memberName: string
  memberDocument: string

  // Staff
  staffName: string

  // Items
  items: {
    productName: string
    productCategory: string
    unitType: 'gram' | 'unit'
    quantity: number
    unitPrice: number
    lineTotal: number
    cannabisGrams: number
  }[]

  // Club info
  clubName: string
  clubAddress: string | null
  clubCity: string | null
}

export async function getReceiptData(transactionId: string): Promise<ReceiptData | null> {
  const supabase = createAdminClient()

  // Fetch transaction + items + member + staff + shop in parallel
  const [txnResult, itemsResult, shopResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, created_at, payment_method, total_amount, cannabis_grams_total, item_count, member_id, staff_user_id')
      .eq('id', transactionId)
      .eq('shop_id', SHOP_ID)
      .single(),

    supabase
      .from('transaction_items')
      .select('product_name, product_category, unit_type, quantity, unit_price, line_total, cannabis_grams')
      .eq('transaction_id', transactionId)
      .order('product_category')
      .order('product_name'),

    supabase
      .from('shops')
      .select('name, address, city')
      .eq('id', SHOP_ID)
      .single(),
  ])

  if (!txnResult.data) return null

  const txn = txnResult.data as {
    id: string
    created_at: string
    payment_method: 'cash' | 'card'
    total_amount: number
    cannabis_grams_total: number
    item_count: number
    member_id: string
    staff_user_id: string
  }

  // Fetch member + staff names
  const [memberResult, staffResult] = await Promise.all([
    supabase
      .from('members')
      .select('full_name, document_number')
      .eq('id', txn.member_id)
      .single(),

    supabase
      .from('staff_users')
      .select('full_name')
      .eq('id', txn.staff_user_id)
      .single(),
  ])

  const member = memberResult.data as { full_name: string; document_number: string } | null
  const staff = staffResult.data as { full_name: string } | null
  const shop = shopResult.data as { name: string; address: string | null; city: string | null } | null
  const items = (itemsResult.data as ReceiptData['items'] | null) ?? []

  return {
    transactionId: txn.id,
    createdAt: txn.created_at,
    paymentMethod: txn.payment_method,
    totalAmount: txn.total_amount,
    cannabisGramsTotal: txn.cannabis_grams_total,
    itemCount: txn.item_count,

    memberName: member?.full_name ?? '—',
    memberDocument: member?.document_number ?? '—',

    staffName: staff?.full_name ?? '—',

    items,

    clubName: shop?.name ?? 'Penguin Social Club',
    clubAddress: shop?.address ?? null,
    clubCity: shop?.city ?? 'Barcelona',
  }
}
