'use client'

import { useState, useEffect, useCallback } from 'react'
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

  // Keyboard shortcuts: Enter = confirm, Escape = cancel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Enter') {
      const g = parseFloat(value) || 0
      const exceeds = maxGrams !== null && g > maxGrams
      if (g > 0 && !exceeds) {
        onConfirm(g)
      }
    }
  }, [value, maxGrams, onConfirm, onCancel])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const grams = parseFloat(value) || 0
  const total = Math.round(grams * pricePerGram * 100) / 100
  const exceedsLimit = maxGrams !== null && grams > maxGrams
  const canConfirm = grams > 0 && !exceedsLimit

  function handlePreset(g: number) {
    setValue(g.toString())
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-zinc-100">{productName}</span>
        <span className="text-xs text-zinc-400">{'\u20AC'}{pricePerGram.toFixed(2)}/g</span>
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
                flex-1 rounded-lg py-2.5 text-sm font-medium tabular-nums transition-all
                ${isSelected
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : disabled
                    ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-zinc-700/50 active:scale-95'}
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
          <label htmlFor="gram-input" className="sr-only">{t('pos.enter_grams')}</label>
          <Input
            id="gram-input"
            type="number"
            step="0.1"
            min="0.1"
            max={maxGrams ?? undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.0"
            className="w-24 pr-6 tabular-nums text-center font-medium bg-zinc-800 border-zinc-700 text-white"
            autoFocus
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">g</span>
        </div>

        {grams > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">=</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {'\u20AC'}{total.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          {t('common.cancel')}
        </button>
        <Button
          size="sm"
          onClick={() => onConfirm(grams)}
          disabled={!canConfirm}
          className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-5"
        >
          {t('common.confirm')}
        </Button>
      </div>

      {/* Limit warning */}
      {exceedsLimit && maxGrams !== null && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
          {t('pos.error.limit_daily', { remaining: maxGrams.toString() })}
        </p>
      )}
    </div>
  )
}
