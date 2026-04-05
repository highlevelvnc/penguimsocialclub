'use client'

import { useT } from '@/lib/i18n/client'
import type { Member } from '@/lib/supabase/types'
import type { MemberLimits } from '@/lib/pos/limits'

interface Props {
  member: Member
  limits: MemberLimits
  remainingDaily: number
  remainingMonthly: number
  lastVisit: string | null
  onChangeMember: () => void
}

export function PosMemberCard({
  member,
  limits,
  remainingDaily,
  remainingMonthly,
  lastVisit,
  onChangeMember,
}: Props) {
  const t = useT()

  const dailyPct = limits.dailyLimit > 0
    ? Math.max(0, Math.min(100, ((limits.dailyLimit - remainingDaily) / limits.dailyLimit) * 100))
    : 0
  const monthlyPct = limits.monthlyLimit > 0
    ? Math.max(0, Math.min(100, ((limits.monthlyLimit - remainingMonthly) / limits.monthlyLimit) * 100))
    : 0

  function barColor(pct: number): string {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const initials = member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Top bar with member info */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/40 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-xs">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">{member.full_name}</div>
            <div className="text-[11px] text-zinc-500">
              {member.document_number}
              {lastVisit && (
                <span className="ml-2 text-zinc-600">| {lastVisit}</span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          onClick={onChangeMember}
        >
          {t('pos.change_member')}
        </button>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-px bg-zinc-800/30">
        {/* Daily */}
        <div className="bg-zinc-900 px-4 py-2.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('pos.remaining_today')}</span>
            <span className={`text-lg font-bold tabular-nums ${remainingDaily <= 0 ? 'text-red-400' : 'text-zinc-100'}`}>
              {remainingDaily}g
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor(dailyPct)}`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-zinc-600 tabular-nums">
            {limits.dispensedToday}g / {limits.dailyLimit}g
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-zinc-900 px-4 py-2.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('pos.remaining_month')}</span>
            <span className={`text-lg font-bold tabular-nums ${remainingMonthly <= 0 ? 'text-red-400' : 'text-zinc-100'}`}>
              {remainingMonthly}g
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor(monthlyPct)}`}
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-zinc-600 tabular-nums">
            {limits.dispensedMonth}g / {limits.monthlyLimit}g
          </div>
        </div>
      </div>
    </div>
  )
}
