'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRESETS = [0.5, 1, 2, 3.5, 5]

interface Props {
  productName: string
  pricePerGram: number
  maxGrams: number | null
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
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-zinc-900">{productName}</span>
        <span className="text-xs text-zinc-500">{'\u20AC'}{pricePerGram.toFixed(2)}/g</span>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5">
        {PRESETS.map((g) => {
          const disabled = maxGrams !== null && g > maxGrams
          const isSelected = parseFloat(value) === g
          return (
            <button
              key={g}
              type="button"
              onClick={() => handlePreset(g)}
              disabled={disabled}
              className={`
                flex-1 rounded-lg py-2 text-sm font-medium tabular-nums transition-all
                ${isSelected
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : disabled
                    ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:border-emerald-300 hover:text-emerald-700'}
              `}
            >
              {g}g
            </button>
          )
        })}
      </div>

      {/* Custom input + total */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            min="0.1"
            max={maxGrams ?? undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.0"
            className="w-24 pr-6 tabular-nums text-center font-medium"
            autoFocus
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
        </div>

        {grams > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">=</span>
            <span className="text-lg font-bold text-zinc-900 tabular-nums">
              {'\u20AC'}{total.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <Button
          size="sm"
          onClick={() => onConfirm(grams)}
          disabled={!canConfirm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4"
        >
          {t('common.confirm')}
        </Button>
      </div>

      {/* Limit warning */}
      {exceedsLimit && maxGrams !== null && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
          {t('pos.error.limit_daily', { remaining: maxGrams.toString() })}
        </p>
      )}
    </div>
  )
}
