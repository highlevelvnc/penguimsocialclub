'use client'

import { useState } from 'react'
import Image from 'next/image'
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

/** Maps each category to its product photography */
const categoryImages: Record<ProductCategory, string> = {
  flower: '/flower.png',
  hash: '/hash.png',
  extraction: '/iceolator.png',
  vape: '/oilpen.png',
  edible: '/comestiveis.png',
  beverage: '/comestiveis.png',
  accessory: '/sedas.png',
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
  const [searchQuery, setSearchQuery] = useState('')

  const isSearching = searchQuery.length >= 2
  const filtered = isSearching
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products.filter((p) => p.category === activeCategory)
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
    <div className="flex h-full flex-col overflow-hidden rounded-t-2xl border border-zinc-700/30 bg-zinc-900/40">
      {/* Search + Category tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 overflow-x-auto bg-zinc-900/80">
        {/* Quick search */}
        <div className="relative flex-shrink-0">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="h-8 w-32 rounded-lg border border-zinc-600/40 bg-zinc-800/70 pl-8 pr-6 text-xs text-white placeholder:text-zinc-500 outline-none focus:w-44 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-zinc-800 flex-shrink-0" />
        {PRODUCT_CATEGORIES.map((cat) => {
          const count = categoryCounts.get(cat) ?? 0
          if (count === 0) return null
          const isActive = activeCategory === cat && !isSearching
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setSelectedProduct(null); setSearchQuery('') }}
              className={`
                flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all
                ${isSearching
                  ? 'text-zinc-600 opacity-40'
                  : isActive
                    ? 'bg-zinc-700/60 text-white shadow-sm ring-1 ring-zinc-600/50'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'}
              `}
            >
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={categoryImages[cat]}
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
              {t(`product.category.${cat}`)}
              <span className={`rounded-full bg-zinc-800/60 px-1.5 py-0.5 text-[10px] ${isActive ? 'text-zinc-300 bg-zinc-600/40' : 'text-zinc-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Input overlay */}
      {selectedProduct && (
        <div className="border-b border-zinc-800 px-3 py-3 bg-zinc-900 animate-slide-down">
          {selectedProduct.unit_type === 'gram' ? (
            <GramInput
              productName={selectedProduct.name}
              pricePerGram={selectedProduct.price_per_unit}
              maxGrams={getMaxForProduct(selectedProduct)}
              onConfirm={handleGramConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">{selectedProduct.name}</span>
                <span className="text-xs text-zinc-400">{'\u20AC'}{selectedProduct.price_per_unit.toFixed(2)}/ud</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
                  <button
                    type="button"
                    className="px-3 py-2 text-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    onClick={() => setUnitQty(String(Math.max(1, (parseInt(unitQty) || 1) - 1)))}
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="1"
                    value={unitQty}
                    onChange={(e) => setUnitQty(e.target.value)}
                    className="w-14 text-center tabular-nums font-semibold border-0 shadow-none bg-transparent text-white"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    onClick={() => setUnitQty(String((parseInt(unitQty) || 1) + 1))}
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">=</span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {'\u20AC'}{((parseInt(unitQty) || 1) * selectedProduct.price_per_unit).toFixed(2)}
                  </span>
                </div>
                {selectedProduct.gram_equivalent && (
                  <span className="text-xs text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5 tabular-nums">
                    {((parseInt(unitQty) || 1) * selectedProduct.gram_equivalent).toFixed(2)}g
                  </span>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <Button
                  size="sm"
                  onClick={handleUnitConfirm}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-4"
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3 dark-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center animate-fade-in-up">
            <p className="text-sm text-zinc-600">{t('common.no_results')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 stagger-children">
            {filtered.map((product) => (
              <PosProductCard
                key={product.id}
                product={product}
                subcategoryKey={product.subcategory_id ? (subMap.get(product.subcategory_id) ?? null) : null}
                categoryImage={categoryImages[product.category as ProductCategory]}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
