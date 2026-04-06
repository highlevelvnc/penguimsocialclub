'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { createStockAdjustment } from '@/actions/stock'
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

const ADJUSTMENT_TYPES = ['restock', 'correction', 'loss', 'return'] as const

const typeColors: Record<typeof ADJUSTMENT_TYPES[number], string> = {
  restock: 'text-emerald-600',
  correction: 'text-blue-600',
  loss: 'text-red-600',
  return: 'text-amber-600',
}

interface StockAdjustmentFormProps {
  productId: string
  productName: string
  currentStock: number
  unitType: 'gram' | 'unit'
}

export function StockAdjustmentForm({
  productId,
  productName,
  currentStock,
  unitType,
}: StockAdjustmentFormProps) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [adjustmentType, setAdjustmentType] = useState<typeof ADJUSTMENT_TYPES[number]>('restock')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const unitLabel = unitType === 'gram' ? 'g' : 'ud'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return

    setLoading(true)

    const result = await createStockAdjustment({
      product_id: productId,
      adjustment_type: adjustmentType,
      quantity: qty,
      reason: reason || null,
    })

    setLoading(false)

    if (result.success) {
      toast.success(t('toast.stock_adjusted'))
      setQuantity('')
      setReason('')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">{t('stock.adjustment')}</h3>
          <span className="text-sm font-bold tabular-nums text-zinc-600">
            {currentStock}{unitLabel} {t('product.stock').toLowerCase()}
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">Tipo</Label>
            <Select
              value={adjustmentType}
              onValueChange={(val) => val && setAdjustmentType(val as typeof ADJUSTMENT_TYPES[number])}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className={typeColors[type]}>
                      {t(`stock.${type}`)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="adj_qty" className="text-xs text-zinc-500">
              {t('stock.quantity')}
            </Label>
            <div className="relative">
              <Input
                id="adj_qty"
                type="number"
                step={unitType === 'gram' ? '0.1' : '1'}
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-10 pr-8 tabular-nums font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">{unitLabel}</span>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <Label htmlFor="adj_reason" className="text-xs text-zinc-500">{t('stock.reason')}</Label>
          <Textarea
            id="adj_reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Opcional"
            className="resize-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('common.loading')}
            </span>
          ) : (
            t('common.confirm')
          )}
        </button>
      </form>
    </div>
  )
}
