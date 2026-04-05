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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

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

  // Derived from category
  const unitType = CATEGORY_UNIT_TYPE[category]
  const countsTowardLimit = CATEGORY_COUNTS_TOWARD_LIMIT[category]
  const needsGramEquivalent = CATEGORY_NEEDS_GRAM_EQUIVALENT[category]

  // Filter subcategories for selected category
  const filteredSubcategories = subcategories.filter((s) => s.category === category)

  // Reset subcategory when category changes
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
      toast.success(mode === 'create' ? 'Product created' : 'Product updated')
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
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? t('product.create') : t('common.edit')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('product.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus={mode === 'create'}
            />
          </div>

          {/* Category + Subcategory row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('product.category_label')}</Label>
              <Select
                value={category}
                onValueChange={(val) => val && setCategory(val as ProductCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`product.category.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('product.subcategory')}</Label>
              <Select
                value={subcategoryId}
                onValueChange={(val) => setSubcategoryId(val ?? '')}
              >
                <SelectTrigger className="w-full">
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

          {/* Auto-derived info */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {unitType === 'gram' ? 'Sold by gram' : 'Sold by unit'}
            </span>
            <span>
              {countsTowardLimit ? 'Counts toward limit' : 'No limit'}
            </span>
          </div>

          {/* Price + Stock row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">{priceLabel}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>

            {mode === 'create' && (
              <div className="space-y-1.5">
                <Label htmlFor="stock">{t('product.stock')}</Label>
                <Input
                  id="stock"
                  type="number"
                  step="0.1"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="threshold">{t('product.low_stock_threshold')}</Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>
          </div>

          {/* Gram equivalent — only for unit-based cannabis */}
          {needsGramEquivalent && (
            <div className="space-y-1.5">
              <Label htmlFor="gram_eq">{t('product.gram_equivalent')}</Label>
              <Input
                id="gram_eq"
                type="number"
                step="0.01"
                min="0.01"
                value={gramEquivalent}
                onChange={(e) => setGramEquivalent(e.target.value)}
                required
                placeholder="e.g. 0.5"
              />
              <p className="text-xs text-muted-foreground">
                Grams of cannabis this unit counts toward the dispensing limit
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">{t('product.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Sort order + Active row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="active">{t('common.active')}</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('common.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
