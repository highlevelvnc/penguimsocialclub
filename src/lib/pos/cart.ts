import type { Product, ProductCategory } from '@/lib/supabase/types'

export interface CartItem {
  id: string // unique key for this cart line (generated)
  productId: string
  productName: string
  productCategory: ProductCategory
  unitType: 'gram' | 'unit'
  quantity: number
  unitPrice: number
  lineTotal: number
  cannabisGrams: number // grams toward limit (0 for accessories)
  countsTowardLimit: boolean
}

export interface CartState {
  items: CartItem[]
  totalAmount: number
  cannabisGramsTotal: number
  itemCount: number
}

export const EMPTY_CART: CartState = {
  items: [],
  totalAmount: 0,
  cannabisGramsTotal: 0,
  itemCount: 0,
}

let cartItemCounter = 0

export function addToCart(
  cart: CartState,
  product: Product,
  quantity: number
): CartState {
  const lineTotal = Math.round(product.price_per_unit * quantity * 100) / 100

  let cannabisGrams = 0
  if (product.counts_toward_limit) {
    if (product.unit_type === 'gram') {
      cannabisGrams = quantity
    } else if (product.gram_equivalent) {
      cannabisGrams = Math.round(quantity * product.gram_equivalent * 100) / 100
    }
  }

  const item: CartItem = {
    id: `cart-${++cartItemCounter}`,
    productId: product.id,
    productName: product.name,
    productCategory: product.category,
    unitType: product.unit_type,
    quantity,
    unitPrice: product.price_per_unit,
    lineTotal,
    cannabisGrams,
    countsTowardLimit: product.counts_toward_limit,
  }

  const items = [...cart.items, item]
  return recalculate(items)
}

export function removeFromCart(cart: CartState, cartItemId: string): CartState {
  const items = cart.items.filter((i) => i.id !== cartItemId)
  return recalculate(items)
}

export function clearCart(): CartState {
  return { ...EMPTY_CART }
}

function recalculate(items: CartItem[]): CartState {
  let totalAmount = 0
  let cannabisGramsTotal = 0

  for (const item of items) {
    totalAmount += item.lineTotal
    cannabisGramsTotal += item.cannabisGrams
  }

  return {
    items,
    totalAmount: Math.round(totalAmount * 100) / 100,
    cannabisGramsTotal: Math.round(cannabisGramsTotal * 100) / 100,
    itemCount: items.length,
  }
}
