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
  maxCannabisGrams: number | null
  onAddGramProduct: (product: Product, grams: number) => void
  onAddUnitProduct: (product: Product, quantity: number) => void
}

const categoryIcons: Record<ProductCategory, string> = {
  flower: '\uD83C\uDF3F',
  hash: '\uD83D\uDFE4',
  extraction: '\uD83D\uDCA7',
  vape: '\uD83D\uDCA8',
  edible: '\uD83C\uDF6A',
  beverage: '\uD83C\uDF75',
  accessory: '\uD83D\uDEE0\uFE0F',
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

  const filtered = products.filter((p) => p.category === activeCategory)
  const subMap = new Map(subcategories.map((s) => [s.id, s.key]))

  const categoryCounts = new Map<string, number>()
  for (const p of products) {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1)
  }

  function handleProductSelect(product: Product) {
    setSelectedProduct(product)
    setUnitQty('1')
  }

  function handleGramConfirm(grams: number) {
    if (selectedProduct) {
      onAddGramProduct(selectedProduct, grams)
      setSelectedProduct(null)
    }
  }

  function handleUnitConfirm() {
    if (selectedProduct) {
      onAddUnitProduct(selectedProduct, parseInt(unitQty) || 1)
      setSelectedProduct(null)
      setUnitQty('1')
    }
  }

  function handleCancel() {
    setSelectedProduct(null)
    setUnitQty('1')
  }

  function getMaxForProduct(product: Product): number | null {
    if (!product.counts_toward_limit) return null
    if (maxCannabisGrams === null) return null
    if (product.unit_type === 'gram') return Math.max(0, maxCannabisGrams)
    return null
  }

  return (
    <div className="flex h-full flex-col bg-white rounded-t-xl border border-zinc-200 overflow-hidden">
      {/* Category tabs */}
      <div className="flex gap-1 border-b border-zinc-100 px-3 py-2 overflow-x-auto bg-zinc-50/50">
        {PRODUCT_CATEGORIES.map((cat) => {
          const count = categoryCounts.get(cat) ?? 0
          if (count === 0) return null
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setSelectedProduct(null) }}
              className={`
                flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                ${isActive
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'}
              `}
            >
              <span className="text-sm">{categoryIcons[cat]}</span>
              {t(`product.category.${cat}`)}
              <span className={`text-[10px] ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Input overlay */}
      {selectedProduct && (
        <div className="border-b border-zinc-200 px-3 py-3 bg-white">
          {selectedProduct.unit_type === 'gram' ? (
            <GramInput
              productName={selectedProduct.name}
              pricePerGram={selectedProduct.price_per_unit}
              maxGrams={getMaxForProduct(selectedProduct)}
              onConfirm={handleGramConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900">{selectedProduct.name}</span>
                <span className="text-xs text-zinc-500">{'\u20AC'}{selectedProduct.price_per_unit.toFixed(2)}/ud</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    className="px-3 py-2 text-lg text-zinc-500 hover:bg-zinc-50 transition-colors"
                    onClick={() => setUnitQty(String(Math.max(1, (parseInt(unitQty) || 1) - 1)))}
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="1"
                    value={unitQty}
                    onChange={(e) => setUnitQty(e.target.value)}
                    className="w-14 text-center tabular-nums font-semibold border-0 shadow-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-lg text-zinc-500 hover:bg-zinc-50 transition-colors"
                    onClick={() => setUnitQty(String((parseInt(unitQty) || 1) + 1))}
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">=</span>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">
                    {'\u20AC'}{((parseInt(unitQty) || 1) * selectedProduct.price_per_unit).toFixed(2)}
                  </span>
                </div>
                {selectedProduct.gram_equivalent && (
                  <span className="text-xs text-zinc-400 bg-zinc-100 rounded px-1.5 py-0.5">
                    {((parseInt(unitQty) || 1) * selectedProduct.gram_equivalent).toFixed(2)}g
                  </span>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <Button
                  size="sm"
                  onClick={handleUnitConfirm}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4"
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">{t('common.no_results')}</p>
          </div>
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
