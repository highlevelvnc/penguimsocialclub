'use client'

import { useT } from '@/lib/i18n/client'
import type { Product } from '@/lib/supabase/types'

interface Props {
  product: Product
  subcategoryKey: string | null
  onSelect: (product: Product) => void
}

export function PosProductCard({ product, subcategoryKey, onSelect }: Props) {
  const t = useT()

  const outOfStock = product.stock_quantity <= 0
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold
  const unitSuffix = product.unit_type === 'gram' ? 'g' : ''
  const priceLabel = product.unit_type === 'gram'
    ? `\u20AC${product.price_per_unit.toFixed(2)}/g`
    : `\u20AC${product.price_per_unit.toFixed(2)}`

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={outOfStock}
      className={`
        group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150
        ${outOfStock
          ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-40'
          : 'border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 active:scale-[0.98] cursor-pointer'}
      `}
    >
      {/* Low stock indicator */}
      {lowStock && !outOfStock && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white" />
      )}

      <div>
        <div className="font-semibold text-sm text-zinc-900 leading-tight">{product.name}</div>
        {subcategoryKey && (
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {t(`product.subcategory.${subcategoryKey}`)}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-base font-bold text-emerald-600 tabular-nums">{priceLabel}</span>
        <span className={`text-[11px] tabular-nums ${
          outOfStock ? 'text-red-500 font-medium' : lowStock ? 'text-amber-600' : 'text-zinc-400'
        }`}>
          {outOfStock
            ? t('product.out_of_stock')
            : `${product.stock_quantity}${unitSuffix}`}
        </span>
      </div>
    </button>
  )
}
