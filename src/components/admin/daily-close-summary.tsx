'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { closeDay, type DailySummary } from '@/actions/close'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('close.title')}</CardTitle>
          <span className="text-sm text-muted-foreground tabular-nums">{date}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SummaryItem
            label={t('close.total_transactions')}
            value={summary.total_transactions.toString()}
          />
          <SummaryItem
            label={t('close.total_revenue')}
            value={`\u20AC${summary.total_revenue.toFixed(2)}`}
            bold
          />
          <SummaryItem
            label={t('close.members_served')}
            value={summary.unique_members_served.toString()}
          />
          <SummaryItem
            label={t('close.cash_total')}
            value={`\u20AC${summary.cash_total.toFixed(2)}`}
          />
          <SummaryItem
            label={t('close.card_total')}
            value={`\u20AC${summary.card_total.toFixed(2)}`}
          />
          <SummaryItem
            label={t('close.cannabis_dispensed')}
            value={`${summary.cannabis_grams_dispensed}g`}
          />
        </div>

        <Separator />

        {/* Cash reconciliation */}
        {alreadyClosed ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-sm font-medium text-green-800">
              {t('close.already_closed')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Cash reconciliation</h3>

            <div className="grid grid-cols-3 gap-4 items-end">
              {/* Expected */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t('close.expected_cash')}
                </Label>
                <div className="h-9 flex items-center rounded-md border bg-zinc-50 px-3 text-sm font-medium tabular-nums">
                  {'\u20AC'}{summary.cash_total.toFixed(2)}
                </div>
              </div>

              {/* Actual input */}
              <div className="space-y-1">
                <Label htmlFor="actual_cash" className="text-xs">
                  {t('close.actual_cash')}
                </Label>
                <Input
                  id="actual_cash"
                  type="number"
                  step="0.01"
                  min="0"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="tabular-nums"
                />
              </div>

              {/* Difference */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t('close.difference')}
                </Label>
                <div className={`h-9 flex items-center rounded-md border px-3 text-sm font-bold tabular-nums ${
                  difference === 0
                    ? 'bg-green-50 text-green-700'
                    : difference > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                }`}>
                  {difference > 0 ? '+' : ''}{'\u20AC'}{difference.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="close_notes" className="text-xs">
                {t('close.notes')}
              </Label>
              <Textarea
                id="close_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional"
              />
            </div>

            {/* Close button */}
            <Button
              onClick={handleClose}
              disabled={loading || summary.total_transactions === 0}
              className="w-full h-12 text-lg"
            >
              {loading ? t('common.loading') : t('close.close_day')}
            </Button>

            {summary.total_transactions === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                No transactions today — nothing to close.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg tabular-nums ${bold ? 'font-bold' : 'font-semibold'}`}>
        {value}
      </div>
    </div>
  )
}
