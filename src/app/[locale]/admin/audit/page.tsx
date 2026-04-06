import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getAuditLog } from '@/actions/audit'

export const metadata: Metadata = { title: 'Audit | Penguin' }

const actionColors: Record<string, string> = {
  checkout: 'bg-emerald-50 text-emerald-700',
  'member.create': 'bg-blue-50 text-blue-700',
  'member.update': 'bg-blue-50 text-blue-700',
  'product.create': 'bg-purple-50 text-purple-700',
  'stock.adjust': 'bg-amber-50 text-amber-700',
  'checkin': 'bg-cyan-50 text-cyan-700',
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const entries = await getAuditLog(100)

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{tr['audit.title']}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{tr['audit.description']}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">📋</span>
            <p className="mt-2 text-sm text-zinc-400">{tr['audit.no_entries']}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {entries.map((entry) => {
              const date = new Date(entry.created_at)
              const color = actionColors[entry.action] ?? 'bg-zinc-100 text-zinc-600'
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/50 transition-colors">
                  {/* Time */}
                  <div className="w-24 flex-shrink-0">
                    <div className="text-xs font-medium text-zinc-700 tabular-nums">
                      {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-zinc-400 tabular-nums">
                      {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>

                  {/* Action badge */}
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${color}`}>
                    {entry.action}
                  </span>

                  {/* Staff */}
                  <span className="flex-shrink-0 text-xs font-medium text-zinc-600">
                    {entry.staff_name}
                  </span>

                  {/* Details */}
                  <span className="flex-1 text-xs text-zinc-400 truncate">
                    {entry.details ?? '—'}
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
