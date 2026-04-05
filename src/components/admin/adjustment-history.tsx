import type { AdjustmentWithStaff } from '@/actions/stock'

interface Props {
  adjustments: AdjustmentWithStaff[]
  unitType: 'gram' | 'unit'
  translations: Record<string, string>
}

const typeColors: Record<string, string> = {
  restock: 'bg-emerald-50 text-emerald-700',
  correction: 'bg-blue-50 text-blue-700',
  loss: 'bg-red-50 text-red-700',
  return: 'bg-amber-50 text-amber-700',
}

export function AdjustmentHistory({ adjustments, unitType, translations: tr }: Props) {
  const unitSuffix = unitType === 'gram' ? 'g' : ''

  if (adjustments.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-zinc-900">{tr['stock.adjustment']} — Historial</h3>
      </div>
      <div className="divide-y divide-zinc-50">
        {adjustments.map((adj) => {
          const isPositive = adj.quantity > 0
          const typeKey = `stock.${adj.adjustment_type}` as keyof typeof tr
          const colorClass = typeColors[adj.adjustment_type] ?? 'bg-zinc-100 text-zinc-600'
          const date = new Date(adj.created_at)

          return (
            <div key={adj.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50/50 transition-colors">
              {/* Type badge */}
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${colorClass}`}>
                {tr[typeKey] ?? adj.adjustment_type}
              </span>

              {/* Date */}
              <div className="w-32 flex-shrink-0">
                <div className="text-xs font-medium text-zinc-700 tabular-nums">
                  {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div className="text-[11px] text-zinc-400 tabular-nums">
                  {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Quantity */}
              <div className={`text-sm font-bold tabular-nums flex-shrink-0 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{adj.quantity}{unitSuffix}
              </div>

              {/* Reason */}
              <div className="flex-1 min-w-0 text-xs text-zinc-400 truncate">
                {adj.reason || '—'}
              </div>

              {/* Staff */}
              <div className="flex-shrink-0 text-xs text-zinc-400">
                {adj.staff_users?.full_name ?? '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
