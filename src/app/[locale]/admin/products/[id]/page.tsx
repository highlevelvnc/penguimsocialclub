import { notFound } from 'next/navigation'
import { getProduct, getSubcategories } from '@/actions/products'
import { getStockAdjustments } from '@/actions/stock'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { ProductForm } from '@/components/admin/product-form'
import { StockAdjustmentForm } from '@/components/admin/stock-adjustment-form'
import { AdjustmentHistory } from '@/components/admin/adjustment-history'

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

  return (
    <div className="space-y-6 max-w-2xl">
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

      <StockAdjustmentForm
        productId={product.id}
        productName={product.name}
        currentStock={product.stock_quantity}
        unitType={product.unit_type}
      />

      <AdjustmentHistory
        adjustments={adjustments}
        unitType={product.unit_type}
        translations={tr}
      />
    </div>
  )
}
