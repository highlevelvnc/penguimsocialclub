'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRESETS = [0.5, 1, 2, 3.5, 5]

interface Props {
  productName: string
  pricePerGram: number
  maxGrams: number | null // null = no limit (accessories)
  onConfirm: (grams: number) => void
  onCancel: () => void
}

export function GramInput({ productName, pricePerGram, maxGrams, onConfirm, onCancel }: Props) {
  const t = useT()
  const [value, setValue] = useState('')

  const grams = parseFloat(value) || 0
  const total = Math.round(grams * pricePerGram * 100) / 100
  const exceedsLimit = maxGrams !== null && grams > maxGrams
  const canConfirm = grams > 0 && !exceedsLimit

  function handlePreset(g: number) {
    setValue(g.toString())
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{productName}</div>

      {/* Preset buttons */}
      <div className="flex gap-1.5">
        {PRESETS.map((g) => {
          const disabled = maxGrams !== null && g > maxGrams
          return (
            <Button
              key={g}
              variant="outline"
              size="sm"
              className="tabular-nums"
              onClick={() => handlePreset(g)}
              disabled={disabled}
            >
              {g}g
            </Button>
          )
        })}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.1"
          min="0.1"
          max={maxGrams ?? undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('pos.enter_grams')}
          className="w-28 tabular-nums"
          autoFocus
        />
        <span className="text-sm text-muted-foreground">g</span>
        {grams > 0 && (
          <span className="text-sm font-medium tabular-nums">
            = {'\u20AC'}{total.toFixed(2)}
          </span>
        )}
      </div>

      {/* Limit warning */}
      {exceedsLimit && maxGrams !== null && (
        <p className="text-xs text-red-600">
          {t('pos.error.limit_daily', { remaining: maxGrams.toString() })}
        </p>
      )}

      {/* Confirm / Cancel */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onConfirm(grams)} disabled={!canConfirm}>
          {t('common.confirm')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}
