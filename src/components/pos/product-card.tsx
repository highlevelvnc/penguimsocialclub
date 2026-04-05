'use client'

import Image from 'next/image'
import { useT } from '@/lib/i18n/client'
import type { Product } from '@/lib/supabase/types'

interface Props {
  product: Product
  subcategoryKey: string | null
  categoryImage: string
  onSelect: (product: Product) => void
}

export function PosProductCard({ product, subcategoryKey, categoryImage, onSelect }: Props) {
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
        group relative flex flex-col rounded-2xl border text-left transition-all duration-200 overflow-hidden
        min-h-[130px]
        ${outOfStock
          ? 'cursor-not-allowed border-zinc-800 bg-zinc-900/40 opacity-40'
          : 'border-zinc-800 bg-zinc-900 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.97] cursor-pointer'}
      `}
    >
      {/* Low stock dot */}
      {lowStock && !outOfStock && (
        <div className="absolute top-2.5 right-2.5 z-10 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/40" />
      )}

      {/* Category image — subtle background */}
      <div className="absolute bottom-0 right-0 h-20 w-20 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300">
        <Image
          src={categoryImage}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-3.5">
        <div>
          <div className="text-sm font-semibold leading-tight text-zinc-100 group-hover:text-white transition-colors">
            {product.name}
          </div>
          {subcategoryKey && (
            <div className="mt-0.5 text-[11px] text-zinc-500">
              {t(`product.subcategory.${subcategoryKey}`)}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <span className="text-base font-bold text-emerald-400 tabular-nums">{priceLabel}</span>
          <span className={`text-[11px] tabular-nums ${
            outOfStock ? 'text-red-400 font-medium' : lowStock ? 'text-amber-400' : 'text-zinc-500'
          }`}>
            {outOfStock
              ? t('product.out_of_stock')
              : `${product.stock_quantity}${unitSuffix}`}
          </span>
        </div>
      </div>
    </button>
  )
}
