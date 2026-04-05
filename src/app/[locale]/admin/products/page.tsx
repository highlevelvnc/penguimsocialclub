import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getProducts } from '@/actions/products'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/supabase/types'
import { ProductCategoryFilter } from '@/components/admin/product-category-filter'

const categoryIcons: Record<ProductCategory, string> = {
  flower: '🌿',
  hash: '🟤',
  extraction: '💧',
  vape: '💨',
  edible: '🍬',
  beverage: '🍵',
  accessory: '🛠️',
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category: categoryParam } = await searchParams
  const tr = getTranslations(locale as Locale)

  const categoryFilter = categoryParam && PRODUCT_CATEGORIES.includes(categoryParam as ProductCategory)
    ? (categoryParam as ProductCategory)
    : undefined

  const products = await getProducts(categoryFilter)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{tr['product.title']}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{products.length} {tr['product.title'].toLowerCase()}</p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {tr['product.create']}
        </Link>
      </div>

      {/* Category filter */}
      <ProductCategoryFilter
        currentCategory={categoryFilter ?? null}
        locale={locale}
      />

      {/* Products list */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">📦</span>
            <p className="mt-2 text-sm text-zinc-400">{tr['common.no_results']}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['product.name']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['product.category_label']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-right">{tr['product.price_per_unit']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-right">{tr['product.stock']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['common.status']}</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-50">
              {products.map((p) => {
                const isLowStock = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
                const isOutOfStock = p.stock_quantity <= 0
                const unitSuffix = p.unit_type === 'gram' ? 'g' : ''

                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/admin/products/${p.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-zinc-50/70 transition-colors"
                  >
                    {/* Name */}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">{p.name}</div>
                      {p.subcategories && (
                        <div className="text-[11px] text-zinc-400">
                          {tr[`product.subcategory.${p.subcategories.key}`] ?? p.subcategories.key}
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>{categoryIcons[p.category as ProductCategory]}</span>
                      {tr[`product.category.${p.category}`]}
                    </div>

                    {/* Price */}
                    <div className="text-right text-sm font-semibold text-zinc-900 tabular-nums flex-shrink-0">
                      {'\u20AC'}{p.price_per_unit.toFixed(2)}{p.unit_type === 'gram' ? '/g' : ''}
                    </div>

                    {/* Stock */}
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold tabular-nums ${
                        isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-zinc-700'
                      }`}>
                        {p.stock_quantity}{unitSuffix}
                      </span>
                      {isOutOfStock && (
                        <div className="text-[10px] text-red-500 font-medium">{tr['product.out_of_stock']}</div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <div className="text-[10px] text-amber-500 font-medium">{tr['product.low_stock']}</div>
                      )}
                    </div>

                    {/* Active status */}
                    <div className="flex-shrink-0">
                      {p.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {tr['common.active']}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {tr['common.inactive']}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
