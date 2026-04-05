'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/supabase/types'

const categoryIcons: Record<ProductCategory, string> = {
  flower: '🌿',
  hash: '🟤',
  extraction: '💧',
  vape: '💨',
  edible: '🍬',
  beverage: '🍵',
  accessory: '🛠️',
}

interface Props {
  currentCategory: ProductCategory | null
  locale: string
}

export function ProductCategoryFilter({ currentCategory, locale }: Props) {
  const t = useT()
  const router = useRouter()

  function handleFilter(category: ProductCategory | null) {
    const url = category
      ? `/${locale}/admin/products?category=${category}`
      : `/${locale}/admin/products`
    router.push(url)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => handleFilter(null)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
          currentCategory === null
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
        }`}
      >
        {t('common.all') || 'Todos'}
      </button>
      {PRODUCT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => handleFilter(cat)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
            currentCategory === cat
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
          }`}
        >
          <span>{categoryIcons[cat]}</span>
          {t(`product.category.${cat}`)}
        </button>
      ))}
    </div>
  )
}
