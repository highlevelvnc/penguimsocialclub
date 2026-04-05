'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { createStockAdjustment } from '@/actions/stock'
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

const ADJUSTMENT_TYPES = ['restock', 'correction', 'loss', 'return'] as const

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

  const unitLabel = unitType === 'gram' ? 'g' : 'units'

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
      toast.success(t('stock.adjustment') + ' OK')
      setQuantity('')
      setReason('')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('stock.adjustment')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {productName} — {t('product.stock')}: {currentStock}{unitLabel}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={adjustmentType}
                onValueChange={(val) => val && setAdjustmentType(val as typeof ADJUSTMENT_TYPES[number])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`stock.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="adj_qty">
                {t('stock.quantity')} ({unitLabel})
              </Label>
              <Input
                id="adj_qty"
                type="number"
                step={unitType === 'gram' ? '0.1' : '1'}
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="adj_reason">{t('stock.reason')}</Label>
            <Textarea
              id="adj_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Optional"
            />
          </div>

          <Button type="submit" disabled={loading} size="sm">
            {loading ? t('common.loading') : t('common.confirm')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
