'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID, CATEGORY_UNIT_TYPE, CATEGORY_COUNTS_TOWARD_LIMIT } from '@/lib/constants'
import type { ProductCategory, Product, Subcategory } from '@/lib/supabase/types'

export interface ProductFormData {
  name: string
  category: ProductCategory
  subcategory_id: string | null
  price_per_unit: number
  stock_quantity: number
  low_stock_threshold: number
  gram_equivalent: number | null
  description: string | null
  sort_order: number
  active: boolean
}

export type ProductWithSubcategory = Product & {
  subcategories: Pick<Subcategory, 'id' | 'key' | 'category'> | null
}

export async function createProduct(data: ProductFormData): Promise<
  { success: true; id: string } | { success: false; error: string }
> {
  const supabase = createAdminClient()

  const unitType = CATEGORY_UNIT_TYPE[data.category]
  const countsTowardLimit = CATEGORY_COUNTS_TOWARD_LIMIT[data.category]

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      shop_id: SHOP_ID,
      name: data.name.trim(),
      category: data.category,
      subcategory_id: data.subcategory_id || null,
      unit_type: unitType,
      price_per_unit: data.price_per_unit,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      counts_toward_limit: countsTowardLimit,
      gram_equivalent: unitType === 'unit' && countsTowardLimit ? data.gram_equivalent : null,
      description: data.description?.trim() || null,
      sort_order: data.sort_order,
      active: data.active,
    })
    .select('id')
    .single()

  if (error || !product) {
    return { success: false, error: error?.message ?? 'Failed to create product' }
  }

  revalidatePath('/[locale]/admin/products')
  return { success: true, id: (product as { id: string }).id }
}

export async function updateProduct(id: string, data: ProductFormData): Promise<
  { success: true } | { success: false; error: string }
> {
  const supabase = createAdminClient()

  const unitType = CATEGORY_UNIT_TYPE[data.category]
  const countsTowardLimit = CATEGORY_COUNTS_TOWARD_LIMIT[data.category]

  const { error } = await supabase
    .from('products')
    .update({
      name: data.name.trim(),
      category: data.category,
      subcategory_id: data.subcategory_id || null,
      unit_type: unitType,
      price_per_unit: data.price_per_unit,
      low_stock_threshold: data.low_stock_threshold,
      counts_toward_limit: countsTowardLimit,
      gram_equivalent: unitType === 'unit' && countsTowardLimit ? data.gram_equivalent : null,
      description: data.description?.trim() || null,
      sort_order: data.sort_order,
      active: data.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('shop_id', SHOP_ID)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/[locale]/admin/products')
  revalidatePath(`/[locale]/admin/products/${id}`)
  return { success: true }
}

export async function getProduct(id: string): Promise<ProductWithSubcategory | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('products')
    .select('*, subcategories(id, key, category)')
    .eq('id', id)
    .eq('shop_id', SHOP_ID)
    .single()

  return (data as ProductWithSubcategory | null) ?? null
}

export async function getProducts(categoryFilter?: ProductCategory): Promise<ProductWithSubcategory[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('products')
    .select('*, subcategories(id, key, category)')
    .eq('shop_id', SHOP_ID)
    .order('category')
    .order('sort_order')
    .order('name')

  if (categoryFilter) {
    query = query.eq('category', categoryFilter)
  }

  const { data } = await query
  return (data as ProductWithSubcategory[] | null) ?? []
}

export async function getSubcategories(): Promise<Pick<Subcategory, 'id' | 'key' | 'category'>[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('subcategories')
    .select('id, key, category')
    .eq('shop_id', SHOP_ID)
    .eq('active', true)
    .order('category')
    .order('sort_order')

  return (data as Pick<Subcategory, 'id' | 'key' | 'category'>[] | null) ?? []
}
