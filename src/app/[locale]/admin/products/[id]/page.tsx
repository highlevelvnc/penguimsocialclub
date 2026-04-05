import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getSubcategories } from '@/actions/products'
import { getStockAdjustments } from '@/actions/stock'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { ProductForm } from '@/components/admin/product-form'
import { StockAdjustmentForm } from '@/components/admin/stock-adjustment-form'
import { AdjustmentHistory } from '@/components/admin/adjustment-history'

const categoryIcons: Record<string, string> = {
  flower: '🌿',
  hash: '🟤',
  extraction: '💧',
  vape: '💨',
  edible: '🍬',
  beverage: '🍵',
  accessory: '🛠️',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const [product, subcategories, adjustments] = await Promise.all([
    getProduct(id),
    getSubcategories(),
    getStockAdjustments(id),
  ])

  if (!product) {
    notFound()
  }

  const tr = getTranslations(locale as Locale)
  const isOutOfStock = product.stock_quantity <= 0
  const isLowStock = product.stock_quantity <= product.low_stock_threshold && !isOutOfStock
  const unitSuffix = product.unit_type === 'gram' ? 'g' : ' ud'

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back link */}
      <Link
        href={`/${locale}/admin/products`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {tr['product.title']}
      </Link>

      {/* Product header */}
      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryIcons[product.category] ?? '📦'}</span>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">{product.name}</h1>
              <div className="text-sm text-zinc-400">{tr[`product.category.${product.category}`]}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold tabular-nums ${
              isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-600' : 'text-zinc-900'
            }`}>
              {product.stock_quantity}{unitSuffix}
            </div>
            <div className="text-[11px] text-zinc-400">{tr['product.stock']}</div>
          </div>
        </div>
      </div>

      {/* Stock adjustment */}
      <StockAdjustmentForm
        productId={product.id}
        productName={product.name}
        currentStock={product.stock_quantity}
        unitType={product.unit_type}
      />

      {/* Edit form */}
      <ProductForm
        mode="edit"
        productId={product.id}
        initialData={{
          name: product.name,
          category: product.category,
          subcategory_id: product.subcategory_id,
          price_per_unit: product.price_per_unit,
          stock_quantity: product.stock_quantity,
          low_stock_threshold: product.low_stock_threshold,
          gram_equivalent: product.gram_equivalent,
          description: product.description,
          sort_order: product.sort_order,
          active: product.active,
        }}
        subcategories={subcategories}
      />

      {/* Adjustment history */}
      <AdjustmentHistory
        adjustments={adjustments}
        unitType={product.unit_type}
        translations={tr}
      />
    </div>
  )
}
