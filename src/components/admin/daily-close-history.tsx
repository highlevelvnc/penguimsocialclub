import type { DailyClose } from '@/lib/supabase/types'

interface Props {
  closes: DailyClose[]
  translations: Record<string, string>
}

export function DailyCloseHistory({ closes, translations: tr }: Props) {
  if (closes.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-zinc-900">{tr['close.history']}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.date']}</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.total_revenue']}</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.total_transactions']}</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.cash_total']}</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.card_total']}</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.cannabis_dispensed']}</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['close.difference']}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {closes.map((c) => {
              const diff = c.cash_difference ?? 0
              return (
                <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold text-zinc-900 tabular-nums">{c.close_date}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-zinc-900">
                    {'\u20AC'}{c.total_revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {c.total_transactions}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {'\u20AC'}{c.cash_total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {'\u20AC'}{c.card_total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {c.cannabis_grams_dispensed}g
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      diff === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : diff > 0
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {diff > 0 ? '+' : ''}{'\u20AC'}{diff.toFixed(2)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
