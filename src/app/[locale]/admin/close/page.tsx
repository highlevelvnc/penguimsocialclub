import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getDailySummary, isAlreadyClosed, getCloseHistory } from '@/actions/close'
import { getStockAlerts } from '@/actions/stock-alerts'
import { DailyCloseSummary } from '@/components/admin/daily-close-summary'
import { DailyCloseHistory } from '@/components/admin/daily-close-history'

export const metadata: Metadata = { title: 'Daily Close | Penguin' }

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export default async function ClosePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const today = todayISO()

  const [summary, alreadyClosed, history, stockAlerts] = await Promise.all([
    getDailySummary(today),
    isAlreadyClosed(today),
    getCloseHistory(),
    getStockAlerts(),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{tr['nav.daily_close']}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{tr['close.expected_cash']}</p>
      </div>

      <DailyCloseSummary
        date={today}
        summary={summary}
        alreadyClosed={alreadyClosed}
      />

      {/* Stock alerts after close */}
      {stockAlerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="border-b border-amber-200 px-5 py-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-sm font-semibold text-amber-800">
              {tr['dashboard.low_stock_alerts']} ({stockAlerts.length})
            </h3>
          </div>
          <div className="divide-y divide-amber-100">
            {stockAlerts.map((p) => {
              const isOut = p.stock_quantity <= 0
              const suffix = p.unit_type === 'gram' ? 'g' : ''
              return (
                <Link
                  key={p.id}
                  href={`/${locale}/admin/products/${p.id}`}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-amber-100/50 transition-colors"
                >
                  <span className="flex-1 text-sm text-amber-900">{p.name}</span>
                  {p.daysUntilStockout !== null && p.daysUntilStockout > 0 && (
                    <span className="text-[11px] text-amber-600">~{p.daysUntilStockout}d</span>
                  )}
                  <span className={`text-sm font-bold tabular-nums ${isOut ? 'text-red-600' : 'text-amber-700'}`}>
                    {p.stock_quantity}{suffix}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <DailyCloseHistory
        closes={history}
        translations={tr}
      />
    </div>
  )
}
