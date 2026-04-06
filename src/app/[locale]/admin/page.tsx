import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getDashboardData } from '@/actions/dashboard'
import { getStockAlerts } from '@/actions/stock-alerts'

export const metadata: Metadata = { title: 'Dashboard | Penguin' }

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const [data, stockAlerts] = await Promise.all([
    getDashboardData(),
    getStockAlerts(),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{tr['dashboard.title']}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{tr['dashboard.today']}</p>
      </div>

      {/* Today's KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label={tr['dashboard.revenue']}
          value={`\u20AC${data.todayRevenue.toFixed(2)}`}
          accent
        />
        <KpiCard
          label={tr['dashboard.transactions']}
          value={data.todayTransactions.toString()}
        />
        <KpiCard
          label={tr['dashboard.cannabis_dispensed']}
          value={`${data.todayCannabis}g`}
          icon="🌿"
        />
        <KpiCard
          label={tr['dashboard.members_served']}
          value={data.todayMembers.toString()}
          icon="👤"
        />
      </div>

      {/* Month + Members row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* This month */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{tr['dashboard.this_month']}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-zinc-900 tabular-nums">{'\u20AC'}{data.monthRevenue.toFixed(2)}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{tr['dashboard.revenue']}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900 tabular-nums">{data.monthTransactions}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{tr['dashboard.transactions']}</div>
            </div>
          </div>
        </div>

        {/* Members overview */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{tr['nav.members']}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">{data.totalActiveMembers}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{tr['dashboard.active_members']}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-400 tabular-nums">{data.totalExpiredMembers}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{tr['dashboard.expired_members']}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold tabular-nums ${data.expiringSoonCount > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>
                {data.expiringSoonCount}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">{tr['dashboard.expiring_soon']}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring memberships banner */}
      {data.expiringMembers.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden animate-fade-in-up">
          <div className="border-b border-amber-200 px-5 py-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-amber-800">
              {tr['dashboard.expiring_soon']} ({data.expiringMembers.length})
            </h3>
          </div>
          <div className="divide-y divide-amber-100">
            {data.expiringMembers.slice(0, 8).map((m) => (
              <Link
                key={m.id}
                href={`/${locale}/admin/members/${m.id}`}
                className="flex items-center justify-between px-5 py-2 hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-sm text-amber-900">{m.full_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-600 tabular-nums">{m.membership_end}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    m.days_left <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {m.days_left}d
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stock alerts + Top products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stock alerts with velocity */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">{tr['dashboard.low_stock_alerts']}</h3>
            {stockAlerts.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1.5">
                {stockAlerts.length}
              </span>
            )}
          </div>
          {stockAlerts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <span className="text-xl">✅</span>
              <p className="mt-1 text-sm text-zinc-400">{tr['dashboard.no_alerts']}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {stockAlerts.slice(0, 6).map((p) => {
                const isOut = p.stock_quantity <= 0
                const suffix = p.unit_type === 'gram' ? 'g' : ''
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/admin/products/${p.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50/70 transition-colors"
                  >
                    <span className="flex-1 text-sm text-zinc-700 truncate">{p.name}</span>
                    {/* Days until stockout */}
                    {p.daysUntilStockout !== null && (
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.daysUntilStockout === 0
                          ? 'bg-red-100 text-red-700'
                          : p.daysUntilStockout <= 3
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {p.daysUntilStockout === 0 ? tr['product.out_of_stock'] : `~${p.daysUntilStockout}d`}
                      </span>
                    )}
                    {/* Current stock */}
                    <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${isOut ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.stock_quantity}{suffix}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-zinc-900">{tr['dashboard.top_products']}</h3>
          </div>
          {data.topProducts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-zinc-400">{tr['dashboard.no_transactions_today']}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {data.topProducts.map((p, i) => (
                <div key={p.product_name} className="flex items-center gap-3 px-5 py-2.5">
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-zinc-700 truncate">{p.product_name}</span>
                  <span className="text-sm font-bold text-zinc-900 tabular-nums">
                    {'\u20AC'}{p.total_revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-900">{tr['dashboard.recent_transactions']}</h3>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-zinc-400">{tr['dashboard.no_transactions_today']}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {data.recentTransactions.map((txn) => {
              const date = new Date(txn.created_at)
              return (
                <div key={txn.id} className="flex items-center gap-4 px-5 py-2.5 hover:bg-zinc-50/50 transition-colors">
                  {/* Time */}
                  <div className="w-12 flex-shrink-0 text-xs text-zinc-400 tabular-nums">
                    {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {/* Member */}
                  <div className="flex-1 min-w-0 text-sm text-zinc-700 truncate">
                    {txn.member_name}
                  </div>
                  {/* Cannabis */}
                  {txn.cannabis_grams_total > 0 && (
                    <span className="text-xs text-zinc-400 tabular-nums">{txn.cannabis_grams_total}g</span>
                  )}
                  {/* Items */}
                  <span className="text-xs text-zinc-400">{txn.item_count} items</span>
                  {/* Payment */}
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    txn.payment_method === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {tr[`pos.checkout_${txn.payment_method}`]}
                  </span>
                  {/* Amount */}
                  <span className="w-16 text-right text-sm font-bold text-zinc-900 tabular-nums">
                    {'\u20AC'}{txn.total_amount.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
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
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</div>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <div className={`mt-1.5 text-xl font-bold tabular-nums ${accent ? 'text-emerald-700' : 'text-zinc-900'}`}>
        {value}
      </div>
    </div>
  )
}
