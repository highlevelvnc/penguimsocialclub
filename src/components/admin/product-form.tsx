'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { createProduct, updateProduct, type ProductFormData } from '@/actions/products'
import {
  PRODUCT_CATEGORIES,
  CATEGORY_UNIT_TYPE,
  CATEGORY_COUNTS_TOWARD_LIMIT,
  CATEGORY_NEEDS_GRAM_EQUIVALENT,
} from '@/lib/constants'
import type { ProductCategory } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const categoryIcons: Record<ProductCategory, string> = {
  flower: '🌿',
  hash: '🟤',
  extraction: '💧',
  vape: '💨',
  edible: '🍬',
  beverage: '🍵',
  accessory: '🛠️',
}

interface SubcategoryOption {
  id: string
  key: string
  category: string
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initialData?: {
    name: string
    category: ProductCategory
    subcategory_id: string | null
    price_per_unit: number
    stock_quantity: number
    low_stock_threshold: number
    gram_equivalent: number | null
    description: string | null
    sort_order: number
    active: boolean
  }
  subcategories: SubcategoryOption[]
}

export function ProductForm({ mode, productId, initialData, subcategories }: ProductFormProps) {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(initialData?.name ?? '')
  const [category, setCategory] = useState<ProductCategory>(initialData?.category ?? 'flower')
  const [subcategoryId, setSubcategoryId] = useState<string>(initialData?.subcategory_id ?? '')
  const [pricePerUnit, setPricePerUnit] = useState(initialData?.price_per_unit?.toString() ?? '')
  const [stockQuantity, setStockQuantity] = useState(initialData?.stock_quantity?.toString() ?? '0')
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.low_stock_threshold?.toString() ?? '0')
  const [gramEquivalent, setGramEquivalent] = useState(initialData?.gram_equivalent?.toString() ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() ?? '0')
  const [active, setActive] = useState(initialData?.active ?? true)

  const unitType = CATEGORY_UNIT_TYPE[category]
  const countsTowardLimit = CATEGORY_COUNTS_TOWARD_LIMIT[category]
  const needsGramEquivalent = CATEGORY_NEEDS_GRAM_EQUIVALENT[category]

  const filteredSubcategories = subcategories.filter((s) => s.category === category)

  useEffect(() => {
    if (!filteredSubcategories.find((s) => s.id === subcategoryId)) {
      setSubcategoryId('')
    }
  }, [category, filteredSubcategories, subcategoryId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData: ProductFormData = {
      name,
      category,
      subcategory_id: subcategoryId || null,
      price_per_unit: parseFloat(pricePerUnit) || 0,
      stock_quantity: parseFloat(stockQuantity) || 0,
      low_stock_threshold: parseFloat(lowStockThreshold) || 0,
      gram_equivalent: needsGramEquivalent ? (parseFloat(gramEquivalent) || null) : null,
      description: description || null,
      sort_order: parseInt(sortOrder) || 0,
      active,
    }

    const result = mode === 'create'
      ? await createProduct(formData)
      : await updateProduct(productId!, formData)

    setLoading(false)

    if (result.success) {
      toast.success(t(mode === 'create' ? 'toast.product_created' : 'toast.product_updated'))
      if (mode === 'create' && 'id' in result) {
        router.push(`/${locale}/admin/products/${result.id}`)
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const priceLabel = unitType === 'gram' ? t('product.price_per_gram') : t('product.price_per_unit')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Section: Category */}
      <FormSection title="Categoría" icon={categoryIcons[category]}>
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-zinc-500">{t('product.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus={mode === 'create'}
              className="h-10"
            />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">{t('product.category_label')}</Label>
              <Select
                value={category}
                onValueChange={(val) => val && setCategory(val as ProductCategory)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryIcons[cat]} {t(`product.category.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">{t('product.subcategory')}</Label>
              <Select
                value={subcategoryId}
                onValueChange={(val) => setSubcategoryId(val ?? '')}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {filteredSubcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {t(`product.subcategory.${sub.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-derived info badges */}
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
              {unitType === 'gram' ? '⚖️ Por gramo' : '📦 Por unidad'}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
              countsTowardLimit ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {countsTowardLimit ? '🌿 Cuenta para límite' : 'Sin límite'}
            </span>
          </div>
        </div>
      </FormSection>

      {/* Section: Pricing & Stock */}
      <FormSection title="Precio & Stock" icon="💰">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs text-zinc-500">{priceLabel}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{'\u20AC'}</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
                className="h-10 pl-7 tabular-nums"
              />
            </div>
          </div>

          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs text-zinc-500">{t('product.stock')}</Label>
              <div className="relative">
                <Input
                  id="stock"
                  type="number"
                  step="0.1"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="h-10 pr-8 tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  {unitType === 'gram' ? 'g' : 'ud'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="threshold" className="text-xs text-zinc-500">{t('product.low_stock_threshold')}</Label>
            <div className="relative">
              <Input
                id="threshold"
                type="number"
                step="0.1"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="h-10 pr-8 tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                {unitType === 'gram' ? 'g' : 'ud'}
              </span>
            </div>
          </div>
        </div>

        {needsGramEquivalent && (
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="gram_eq" className="text-xs text-zinc-500">{t('product.gram_equivalent')}</Label>
            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <Input
                  id="gram_eq"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={gramEquivalent}
                  onChange={(e) => setGramEquivalent(e.target.value)}
                  required
                  placeholder="0.5"
                  className="h-10 pr-8 tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
              </div>
              <p className="text-xs text-zinc-400">gramos equivalentes por unidad para el límite de dispensación</p>
            </div>
          </div>
        )}
      </FormSection>

      {/* Section: Details */}
      <FormSection title="Detalles" icon="📝">
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-zinc-500">{t('product.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Sort order + Active */}
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 w-32">
              <Label htmlFor="sort_order" className="text-xs text-zinc-500">Orden</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive(!active)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  active ? 'bg-emerald-500' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <Label className="text-sm text-zinc-700 cursor-pointer" onClick={() => setActive(!active)}>
                {t('common.active')}
              </Label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('common.loading')}
            </span>
          ) : (
            t('common.save')
          )}
        </button>
        <button
          type="button"
          className="h-11 rounded-xl border border-zinc-200 px-6 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all"
          onClick={() => router.back()}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
