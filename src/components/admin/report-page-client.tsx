'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n/client'
import { getMonthlyReport, type MonthlyReportData } from '@/actions/reports'
import { exportMembersCSV, exportTransactionsCSV, exportProductsCSV } from '@/actions/export'

interface Props {
  translations: Record<string, string>
  locale: string
}

function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function ReportPageClient({ translations: tr, locale }: Props) {
  const t = useT()
  const [month, setMonth] = useState(getCurrentMonth())
  const [report, setReport] = useState<MonthlyReportData | null>(null)
  const [loading, setLoading] = useState(false)

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExportMembers() {
    const csv = await exportMembersCSV()
    downloadCSV(csv, `members_${month}.csv`)
  }

  async function handleExportTransactions() {
    const csv = await exportTransactionsCSV(month)
    downloadCSV(csv, `transactions_${month}.csv`)
  }

  async function handleExportProducts() {
    const csv = await exportProductsCSV()
    downloadCSV(csv, `products_${month}.csv`)
  }

  async function handleGenerate() {
    setLoading(true)
    const data = await getMonthlyReport(month)
    setReport(data)
    setLoading(false)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{tr['report.title'] ?? 'Reports'}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{tr['report.monthly_description'] ?? 'Monthly summary'}</p>
        </div>
      </div>

      {/* Month selector + generate */}
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{tr['report.select_month'] ?? 'Month'}</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="h-10 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('common.loading')}
            </span>
          ) : (
            tr['report.generate'] ?? 'Generate'
          )}
        </button>
        {report && (
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            PDF
          </button>
        )}
      </div>

      {/* CSV exports */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-400 self-center mr-1">CSV:</span>
        <button type="button" onClick={handleExportMembers} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
          {tr['nav.members']}
        </button>
        <button type="button" onClick={handleExportTransactions} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
          {tr['dashboard.transactions']}
        </button>
        <button type="button" onClick={handleExportProducts} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-all">
          {tr['nav.products']}
        </button>
      </div>

      {/* Report content */}
      {report && (
        <div data-receipt className="space-y-5 print:space-y-3 animate-fade-in-up">
          {/* Report header */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 print:border-0 print:p-0 print:pb-4 print:border-b print:border-zinc-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="" width={36} height={36} className="rounded-lg" />
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">{report.clubName}</h2>
                  <p className="text-xs text-zinc-400">{report.clubAddress} · {report.clubCity}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-zinc-900">{report.monthLabel}</div>
                <div className="text-[11px] text-zinc-400">
                  {new Date(report.generatedAt).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
            <ReportKpi label={tr['dashboard.revenue'] ?? 'Revenue'} value={`\u20AC${report.totalRevenue.toFixed(2)}`} accent />
            <ReportKpi label={tr['dashboard.transactions'] ?? 'Transactions'} value={report.totalTransactions.toString()} />
            <ReportKpi label={tr['dashboard.cannabis_dispensed'] ?? 'Cannabis'} value={`${report.totalCannabisGrams}g`} />
            <ReportKpi label={tr['dashboard.members_served'] ?? 'Members'} value={report.uniqueMembersServed.toString()} />
          </div>

          {/* Revenue breakdown */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 print:p-3">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">{tr['dashboard.revenue']}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-zinc-400">{tr['close.cash_total']}</div>
                <div className="text-lg font-bold text-zinc-900 tabular-nums">{'\u20AC'}{report.cashRevenue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-400">{tr['close.card_total']}</div>
                <div className="text-lg font-bold text-zinc-900 tabular-nums">{'\u20AC'}{report.cardRevenue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-400">{tr['report.avg_transaction'] ?? 'Avg. transaction'}</div>
                <div className="text-lg font-bold text-zinc-900 tabular-nums">{'\u20AC'}{report.avgTransactionValue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Members summary */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 print:p-3">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">{tr['nav.members']}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-zinc-400">{tr['dashboard.active_members']}</div>
                <div className="text-lg font-bold text-emerald-600 tabular-nums">{report.totalActiveMembers}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-400">{tr['report.new_members'] ?? 'New'}</div>
                <div className="text-lg font-bold text-zinc-900 tabular-nums">{report.newMembersThisMonth}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-400">{tr['dashboard.members_served']}</div>
                <div className="text-lg font-bold text-zinc-900 tabular-nums">{report.uniqueMembersServed}</div>
              </div>
            </div>
          </div>

          {/* Top products */}
          {report.topProducts.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden print:break-inside-avoid">
              <div className="border-b border-zinc-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-zinc-900">{tr['dashboard.top_products']}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-5 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">#</th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['product.name']}</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['receipt.qty']}</th>
                    <th className="px-5 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['dashboard.revenue']}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {report.topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td className="px-5 py-2 text-xs text-zinc-400">{i + 1}</td>
                      <td className="px-3 py-2 text-sm text-zinc-700">{p.name}</td>
                      <td className="px-3 py-2 text-right text-sm tabular-nums text-zinc-500">{p.quantity}</td>
                      <td className="px-5 py-2 text-right text-sm font-semibold tabular-nums text-zinc-900">{'\u20AC'}{p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Daily breakdown */}
          {report.dailyBreakdown.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden print:break-inside-avoid">
              <div className="border-b border-zinc-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-zinc-900">{tr['report.daily_breakdown'] ?? 'Daily breakdown'}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-5 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.date']}</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.total_transactions']}</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['dashboard.revenue']}</th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">Cannabis</th>
                    <th className="px-5 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['dashboard.members_served']}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {report.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="hover:bg-zinc-50/50">
                      <td className="px-5 py-2 text-sm font-medium text-zinc-700 tabular-nums">{d.date}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{d.transactions}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-zinc-900">{'\u20AC'}{d.revenue.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{d.cannabis}g</td>
                      <td className="px-5 py-2 text-right tabular-nums text-zinc-600">{d.members}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Low stock */}
          {report.lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden print:break-inside-avoid">
              <div className="border-b border-amber-200 px-5 py-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="text-sm font-semibold text-amber-800">{tr['dashboard.low_stock_alerts']}</h3>
              </div>
              <div className="divide-y divide-amber-100">
                {report.lowStockProducts.map((p) => (
                  <div key={p.name} className="flex justify-between px-5 py-2 text-sm">
                    <span className="text-amber-900">{p.name}</span>
                    <span className="font-bold tabular-nums text-amber-700">
                      {p.stock}{p.unit_type === 'gram' ? 'g' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReportKpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 print:p-2 ${accent ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums print:text-lg ${accent ? 'text-emerald-700' : 'text-zinc-900'}`}>{value}</div>
    </div>
  )
}
