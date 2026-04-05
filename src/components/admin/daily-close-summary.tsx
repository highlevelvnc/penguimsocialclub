'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { closeDay, type DailySummary } from '@/actions/close'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Props {
  date: string
  summary: DailySummary
  alreadyClosed: boolean
}

export function DailyCloseSummary({ date, summary, alreadyClosed }: Props) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [actualCash, setActualCash] = useState(summary.cash_total.toFixed(2))
  const [notes, setNotes] = useState('')

  const actualCashNum = parseFloat(actualCash) || 0
  const difference = Math.round((actualCashNum - summary.cash_total) * 100) / 100

  async function handleClose() {
    setLoading(true)

    const result = await closeDay(date, summary, {
      actual_cash: actualCashNum,
      notes: notes || null,
    })

    setLoading(false)

    if (result.success) {
      toast.success(t('close.close_day') + ' OK')
      router.refresh()
    } else {
      toast.error(
        result.error === 'ALREADY_CLOSED'
          ? t('close.already_closed')
          : result.error
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">{t('close.title')}</h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 tabular-nums">
          {date}
        </span>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label={t('close.total_revenue')}
          value={`\u20AC${summary.total_revenue.toFixed(2)}`}
          accent
        />
        <StatCard
          label={t('close.total_transactions')}
          value={summary.total_transactions.toString()}
        />
        <StatCard
          label={t('close.members_served')}
          value={summary.unique_members_served.toString()}
        />
        <StatCard
          label={t('close.cash_total')}
          value={`\u20AC${summary.cash_total.toFixed(2)}`}
          icon="💵"
        />
        <StatCard
          label={t('close.card_total')}
          value={`\u20AC${summary.card_total.toFixed(2)}`}
          icon="💳"
        />
        <StatCard
          label={t('close.cannabis_dispensed')}
          value={`${summary.cannabis_grams_dispensed}g`}
          icon="🌿"
        />
      </div>

      {/* Close section */}
      {alreadyClosed ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">{t('close.already_closed')}</p>
            <p className="text-xs text-emerald-600">Cierre registrado correctamente</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">{t('close.expected_cash')} · Reconciliación</h3>

          <div className="grid grid-cols-3 gap-3 items-end">
            {/* Expected */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">{t('close.expected_cash')}</Label>
              <div className="flex h-10 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-600 tabular-nums">
                {'\u20AC'}{summary.cash_total.toFixed(2)}
              </div>
            </div>

            {/* Actual */}
            <div className="space-y-1.5">
              <Label htmlFor="actual_cash" className="text-xs text-zinc-700">{t('close.actual_cash')}</Label>
              <Input
                id="actual_cash"
                type="number"
                step="0.01"
                min="0"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="h-10 tabular-nums font-semibold"
              />
            </div>

            {/* Difference */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">{t('close.difference')}</Label>
              <div className={`flex h-10 items-center rounded-lg border px-3 text-sm font-bold tabular-nums ${
                difference === 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : difference > 0
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {difference > 0 ? '+' : ''}{'\u20AC'}{difference.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="close_notes" className="text-xs text-zinc-400">{t('close.notes')}</Label>
            <Textarea
              id="close_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t('common.optional') || 'Optional'}
              className="resize-none text-sm"
            />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={loading || summary.total_transactions === 0}
            className="w-full h-12 rounded-xl bg-zinc-900 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t('common.loading')}
              </span>
            ) : (
              t('close.close_day')
            )}
          </button>

          {summary.total_transactions === 0 && (
            <p className="text-xs text-zinc-400 text-center">
              {t('close.no_transactions') || 'No transactions today — nothing to close.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: boolean
  icon?: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</div>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className={`mt-1.5 text-xl font-bold tabular-nums ${accent ? 'text-emerald-700' : 'text-zinc-900'}`}>
        {value}
      </div>
    </div>
  )
}
