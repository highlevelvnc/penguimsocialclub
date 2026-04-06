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
      aria-label={`${product.name} — ${priceLabel}${outOfStock ? ` (${t('product.out_of_stock')})` : ''}`}
      className={`
        animate-fade-in-up
        group relative flex flex-col rounded-2xl border text-left overflow-hidden
        min-h-[140px] transition-all duration-200
        ${outOfStock
          ? 'cursor-not-allowed border-zinc-800/50 bg-zinc-900/30 opacity-35'
          : 'border-zinc-800/60 bg-zinc-900/80 hover:border-emerald-500/30 hover:bg-zinc-800/80 hover:shadow-xl hover:shadow-emerald-500/[0.03] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 cursor-pointer'}
      `}
    >
      {/* Low stock dot */}
      {lowStock && !outOfStock && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
        </div>
      )}

      {/* Category image — subtle background */}
      <div className="absolute bottom-0 right-0 h-24 w-24 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-500">
        <Image
          src={categoryImage}
          alt=""
          width={96}
          height={96}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="text-[13px] font-semibold leading-tight text-zinc-200 group-hover:text-white transition-colors duration-200">
            {product.name}
          </div>
          {subcategoryKey && (
            <div className="mt-1 text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">
              {t(`product.subcategory.${subcategoryKey}`)}
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <span className="text-[15px] font-bold text-emerald-400 tabular-nums group-hover:text-emerald-300 transition-colors">{priceLabel}</span>
          <span className={`text-[11px] tabular-nums ${
            outOfStock ? 'text-red-400/80 font-medium' : lowStock ? 'text-amber-400/80' : 'text-zinc-600'
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
