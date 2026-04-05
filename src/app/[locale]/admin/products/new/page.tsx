import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getSubcategories } from '@/actions/products'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const subcategories = await getSubcategories()

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/products`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {tr['product.title']}
        </Link>
      </div>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{tr['product.create']}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Añadir nuevo producto al catálogo</p>
      </div>
      <ProductForm
        mode="create"
        subcategories={subcategories}
      />
    </div>
  )
}
