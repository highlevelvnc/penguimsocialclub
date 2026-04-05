'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'

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
      <Button
        variant={currentCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilter(null)}
      >
        All
      </Button>
      {PRODUCT_CATEGORIES.map((cat) => (
        <Button
          key={cat}
          variant={currentCategory === cat ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter(cat)}
        >
          {t(`product.category.${cat}`)}
        </Button>
      ))}
    </div>
  )
}
