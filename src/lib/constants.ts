import type { ProductCategory } from '@/lib/supabase/types'

// The shop ID for single-tenant MVP
export const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID!

// Product categories — fixed set, drives business logic
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'flower',
  'hash',
  'extraction',
  'vape',
  'edible',
  'beverage',
  'accessory',
]

// Category → unit type mapping
export const CATEGORY_UNIT_TYPE: Record<ProductCategory, 'gram' | 'unit'> = {
  flower: 'gram',
  hash: 'gram',
  extraction: 'gram',
  vape: 'unit',
  edible: 'unit',
  beverage: 'unit',
  accessory: 'unit',
}

// Category → counts toward dispensing limit
export const CATEGORY_COUNTS_TOWARD_LIMIT: Record<ProductCategory, boolean> = {
  flower: true,
  hash: true,
  extraction: true,
  vape: true,
  edible: true,
  beverage: true,
  accessory: false,
}

// Categories that require gram_equivalent when unit-based
export const CATEGORY_NEEDS_GRAM_EQUIVALENT: Record<ProductCategory, boolean> = {
  flower: false,
  hash: false,
  extraction: false,
  vape: true,
  edible: true,
  beverage: true,
  accessory: false,
}
