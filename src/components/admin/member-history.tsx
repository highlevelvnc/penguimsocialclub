import type { MemberTransaction } from '@/actions/members'

interface Props {
  transactions: MemberTransaction[]
  translations: Record<string, string>
}

export function MemberHistory({ transactions, translations: tr }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <span className="text-2xl">🛒</span>
        <p className="mt-2 text-sm text-zinc-400">{tr['common.no_results']}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-zinc-900">{tr['member.history']}</h3>
      </div>
      <div className="divide-y divide-zinc-50">
        {transactions.map((txn) => {
          const date = new Date(txn.created_at)
          return (
            <div key={txn.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50/50 transition-colors">
              {/* Date */}
              <div className="w-28 flex-shrink-0">
                <div className="text-xs font-medium text-zinc-700 tabular-nums">
                  {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div className="text-[11px] text-zinc-400 tabular-nums">
                  {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Amount */}
              <div className="flex-1">
                <span className="text-sm font-bold text-zinc-900 tabular-nums">
                  {'\u20AC'}{txn.total_amount.toFixed(2)}
                </span>
                {txn.cannabis_grams_total > 0 && (
                  <span className="ml-2 text-xs text-zinc-400 tabular-nums">
                    🌿 {txn.cannabis_grams_total}g
                  </span>
                )}
              </div>

              {/* Items count */}
              <div className="text-xs text-zinc-400">
                {txn.item_count} {txn.item_count === 1 ? 'item' : 'items'}
              </div>

              {/* Payment method */}
              <div className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                txn.payment_method === 'cash'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600'
              }`}>
                {txn.payment_method === 'cash'
                  ? `\uD83D\uDCB5 ${tr['pos.checkout_cash']}`
                  : `\uD83D\uDCB3 ${tr['pos.checkout_card']}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
