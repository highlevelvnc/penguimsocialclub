import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getProducts } from '@/actions/products'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategory } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductCategoryFilter } from '@/components/admin/product-category-filter'

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr['product.title']}</h1>
        <Link href={`/${locale}/admin/products/new`}>
          <Button>{tr['product.create']}</Button>
        </Link>
      </div>

      {/* Category filter */}
      <ProductCategoryFilter
        currentCategory={categoryFilter ?? null}
        locale={locale}
      />

      {/* Products table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr['product.name']}</TableHead>
              <TableHead>{tr['product.category_label']}</TableHead>
              <TableHead className="text-right">{tr['product.price_per_unit']}</TableHead>
              <TableHead className="text-right">{tr['product.stock']}</TableHead>
              <TableHead>{tr['common.status']}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {tr['common.no_results']}
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const isLowStock = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
                const isOutOfStock = p.stock_quantity <= 0
                const unitSuffix = p.unit_type === 'gram' ? 'g' : ''

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/${locale}/admin/products/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {tr[`product.category.${p.category}`]}
                      </span>
                      {p.subcategories && (
                        <span className="text-xs text-muted-foreground ml-1">
                          / {tr[`product.subcategory.${p.subcategories.key}`] ?? p.subcategories.key}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {'\u20AC'}{p.price_per_unit.toFixed(2)}{p.unit_type === 'gram' ? '/g' : ''}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={isOutOfStock ? 'text-red-600 font-semibold' : isLowStock ? 'text-amber-600' : ''}>
                        {p.stock_quantity}{unitSuffix}
                      </span>
                      {isOutOfStock && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          {tr['product.out_of_stock']}
                        </Badge>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge variant="outline" className="ml-2 text-xs text-amber-600 border-amber-300">
                          {tr['product.low_stock']}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.active ? (
                        <Badge variant="outline" className="text-xs">{tr['common.active']}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{tr['common.inactive']}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
