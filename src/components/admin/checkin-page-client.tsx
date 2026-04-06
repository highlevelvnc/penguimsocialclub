'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { checkOutMember, checkOutAll, type ActiveCheckIn } from '@/actions/checkin'
import { toast } from 'sonner'

interface Props {
  activeCheckIns: ActiveCheckIn[]
  occupancy: { current: number; max: number }
  todayCount: number
  translations: Record<string, string>
  locale: string
}

function timeAgo(checkedInAt: string): string {
  const mins = Math.floor((Date.now() - new Date(checkedInAt).getTime()) / 60000)
  if (mins < 1) return '<1 min'
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hrs}h ${remainMins}m`
}

export function CheckInPageClient({
  activeCheckIns,
  occupancy,
  todayCount,
  translations: tr,
  locale,
}: Props) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null) // member_id being checked out

  const occupancyPct = occupancy.max > 0
    ? Math.min(100, Math.round((occupancy.current / occupancy.max) * 100))
    : 0

  function barColor(): string {
    if (occupancyPct >= 90) return 'bg-red-500'
    if (occupancyPct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  async function handleCheckOut(memberId: string) {
    setLoading(memberId)
    const result = await checkOutMember(memberId)
    setLoading(null)

    if (result.success) {
      toast.success(t('checkin.member_left'))
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleCheckOutAll() {
    if (activeCheckIns.length === 0) return
    setLoading('all')
    const result = await checkOutAll()
    setLoading(null)

    if (result.success) {
      toast.success(`${t('checkin.all_checked_out')} (${result.count})`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{tr['checkin.title']}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{tr['checkin.today_visits']}: {todayCount}</p>
        </div>
        {activeCheckIns.length > 0 && (
          <button
            type="button"
            onClick={handleCheckOutAll}
            disabled={loading === 'all'}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading === 'all' ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            )}
            {tr['checkin.check_out_all']}
          </button>
        )}
      </div>

      {/* Occupancy bar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{tr['checkin.occupancy']}</h3>
          <span className="text-lg font-bold text-zinc-900 tabular-nums">
            {occupancy.current} <span className="text-zinc-400 text-sm font-normal">/ {occupancy.max}</span>
          </span>
        </div>
        <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor()}`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-400">
          <span>{occupancyPct}%</span>
          <span>{occupancy.max - occupancy.current} {tr['product.stock'] ? 'disponibles' : 'available'}</span>
        </div>
      </div>

      {/* Active check-ins list */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">{tr['checkin.checked_in']}</h3>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white px-2">
            {activeCheckIns.length}
          </span>
        </div>

        {activeCheckIns.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">🏠</span>
            <p className="mt-2 text-sm text-zinc-400">{tr['checkin.empty_club']}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {activeCheckIns.map((ci) => {
              const initials = ci.member_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              const duration = timeAgo(ci.checked_in_at)
              const entryTime = new Date(ci.checked_in_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={ci.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">{ci.member_name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {tr['checkin.checked_in']}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {ci.member_document} · {tr['checkin.checked_in_at']} {entryTime} · {duration}
                    </div>
                  </div>

                  {/* Check out button */}
                  <button
                    type="button"
                    onClick={() => handleCheckOut(ci.member_id)}
                    disabled={loading === ci.member_id}
                    className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50"
                  >
                    {loading === ci.member_id ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                    ) : (
                      tr['checkin.check_out']
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
