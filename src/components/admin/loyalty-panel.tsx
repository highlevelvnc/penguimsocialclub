'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { adjustPoints, type LoyaltyEntry } from '@/actions/loyalty'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Props {
  memberId: string
  currentPoints: number
  euroPerPoint: number
  history: LoyaltyEntry[]
}

const typeStyles: Record<string, string> = {
  earn: 'bg-emerald-50 text-emerald-700',
  redeem: 'bg-blue-50 text-blue-700',
  adjust: 'bg-zinc-100 text-zinc-600',
}

export function LoyaltyPanel({ memberId, currentPoints, euroPerPoint, history }: Props) {
  const t = useT()
  const router = useRouter()
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [loading, setLoading] = useState(false)

  const pointsValue = Math.round(currentPoints * euroPerPoint * 100) / 100

  async function handleAdjust(isPositive: boolean) {
    const amount = parseInt(adjustAmount)
    if (!amount || amount <= 0) return

    setLoading(true)
    const result = await adjustPoints(memberId, isPositive ? amount : -amount, adjustReason)
    setLoading(false)

    if (result.success) {
      toast.success(`${t('loyalty.points')}: ${result.newBalance}`)
      setAdjustAmount('')
      setAdjustReason('')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t('loyalty.balance')}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{currentPoints}</span>
              <span className="text-sm text-zinc-400">{t('loyalty.points').toLowerCase()}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {t('loyalty.points_value', { value: `\u20AC${pointsValue.toFixed(2)}` })}
            </div>
          </div>
          <div className="text-3xl">⭐</div>
        </div>

        {/* Manual adjustment */}
        <div className="border-t border-zinc-100 px-5 py-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder={t('loyalty.points')}
              className="w-24 h-8 text-sm tabular-nums"
            />
            <Input
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder={t('stock.reason')}
              className="flex-1 h-8 text-sm"
            />
            <button
              type="button"
              onClick={() => handleAdjust(true)}
              disabled={loading || !adjustAmount}
              className="h-8 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600 transition-all disabled:opacity-40"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(false)}
              disabled={loading || !adjustAmount}
              className="h-8 rounded-lg bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600 transition-all disabled:opacity-40"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-zinc-900">{t('loyalty.history')}</h3>
          </div>
          <div className="divide-y divide-zinc-50">
            {history.map((entry) => {
              const date = new Date(entry.created_at)
              const isPositive = entry.points > 0
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50/50 transition-colors">
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeStyles[entry.type]}`}>
                    {t(`loyalty.${entry.type}`)}
                  </span>
                  <div className="w-20 flex-shrink-0 text-xs text-zinc-400 tabular-nums">
                    {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="flex-1 text-xs text-zinc-500 truncate">
                    {entry.description ?? '—'}
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{entry.points}
                  </span>
                  <span className="text-[11px] text-zinc-400 tabular-nums w-12 text-right">
                    {entry.balance_after} pts
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
