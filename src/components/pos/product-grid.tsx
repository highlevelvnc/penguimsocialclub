'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Product, ProductCategory } from '@/lib/supabase/types'
import { PosProductCard } from './product-card'
import { GramInput } from './gram-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SubcategoryInfo {
  id: string
  key: string
  category: string
}

interface Props {
  products: Product[]
  subcategories: SubcategoryInfo[]
  maxCannabisGrams: number | null // remaining grams the member can get (null = no member selected)
  onAddGramProduct: (product: Product, grams: number) => void
  onAddUnitProduct: (product: Product, quantity: number) => void
}

export function PosProductGrid({
  products,
  subcategories,
  maxCannabisGrams,
  onAddGramProduct,
  onAddUnitProduct,
}: Props) {
  const t = useT()
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('flower')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [unitQty, setUnitQty] = useState('1')

  // Filter to active category
  const filtered = products.filter((p) => p.category === activeCategory)

  // Build subcategory lookup
  const subMap = new Map(subcategories.map((s) => [s.id, s.key]))

  // Count products per category (for showing count on tabs)
  const categoryCounts = new Map<string, number>()
  for (const p of products) {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1)
  }

  function handleProductSelect(product: Product) {
    if (product.unit_type === 'gram') {
      setSelectedProduct(product)
    } else {
      // Unit-based: show inline quantity selector
      setSelectedProduct(product)
      setUnitQty('1')
    }
  }

  function handleGramConfirm(grams: number) {
    if (selectedProduct) {
      onAddGramProduct(selectedProduct, grams)
      setSelectedProduct(null)
    }
  }

  function handleUnitConfirm() {
    if (selectedProduct) {
      const qty = parseInt(unitQty) || 1
      onAddUnitProduct(selectedProduct, qty)
      setSelectedProduct(null)
      setUnitQty('1')
    }
  }

  function handleCancel() {
    setSelectedProduct(null)
    setUnitQty('1')
  }

  // Compute max grams for gram input (uses min of daily and monthly remaining)
  function getMaxForProduct(product: Product): number | null {
    if (!product.counts_toward_limit) return null
    if (maxCannabisGrams === null) return null
    if (product.unit_type === 'gram') return Math.max(0, maxCannabisGrams)
    // For unit-based, let the unit selector handle it
    return null
  }

  return (
    <div className="flex h-full flex-col">
      {/* Category tabs */}
      <div className="flex gap-1 border-b bg-white px-2 py-1.5 overflow-x-auto">
        {PRODUCT_CATEGORIES.map((cat) => {
          const count = categoryCounts.get(cat) ?? 0
          if (count === 0) return null
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setSelectedProduct(null) }}
              className={`
                whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition-colors
                ${activeCategory === cat
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'}
              `}
            >
              {t(`product.category.${cat}`)}
            </button>
          )
        })}
      </div>

      {/* Product input overlay (gram or unit) */}
      {selectedProduct && (
        <div className="border-b bg-amber-50 px-4 py-3">
          {selectedProduct.unit_type === 'gram' ? (
            <GramInput
              productName={selectedProduct.name}
              pricePerGram={selectedProduct.price_per_unit}
              maxGrams={getMaxForProduct(selectedProduct)}
              onConfirm={handleGramConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">{selectedProduct.name}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setUnitQty(String(Math.max(1, (parseInt(unitQty) || 1) - 1)))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={unitQty}
                  onChange={(e) => setUnitQty(e.target.value)}
                  className="w-16 text-center tabular-nums"
                />
                <Button
                  variant="outline" size="sm"
                  onClick={() => setUnitQty(String((parseInt(unitQty) || 1) + 1))}
                >
                  +
                </Button>
                <span className="text-sm font-medium tabular-nums ml-2">
                  = {'\u20AC'}{((parseInt(unitQty) || 1) * selectedProduct.price_per_unit).toFixed(2)}
                </span>
                {selectedProduct.gram_equivalent && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({((parseInt(unitQty) || 1) * selectedProduct.gram_equivalent).toFixed(2)}g)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUnitConfirm}>
                  {t('common.confirm')}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('common.no_results')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <PosProductCard
                key={product.id}
                product={product}
                subcategoryKey={product.subcategory_id ? (subMap.get(product.subcategory_id) ?? null) : null}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
