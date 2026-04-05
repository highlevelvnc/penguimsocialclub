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
        flex flex-col justify-between rounded-lg border p-3 text-left transition-colors
        ${outOfStock
          ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-50'
          : 'hover:border-zinc-400 hover:bg-white bg-white cursor-pointer'}
      `}
    >
      <div>
        <div className="font-medium text-sm leading-tight">{product.name}</div>
        {subcategoryKey && (
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t(`product.subcategory.${subcategoryKey}`)}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between">
        <span className="text-sm font-semibold tabular-nums">{priceLabel}</span>
        <span className={`text-xs tabular-nums ${
          outOfStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-muted-foreground'
        }`}>
          {outOfStock
            ? t('product.out_of_stock')
            : `${product.stock_quantity}${unitSuffix}`}
          {lowStock && !outOfStock && ` \u26A0`}
        </span>
      </div>
    </button>
  )
}
