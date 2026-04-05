import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getMember,
  getMemberTransactions,
  getMemberDispensingTotals,
} from '@/actions/members'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { MemberForm } from '@/components/admin/member-form'
import { MemberRenew } from '@/components/admin/member-renew'
import { MemberHistory } from '@/components/admin/member-history'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  expired: 'bg-zinc-100 text-zinc-500',
  suspended: 'bg-red-50 text-red-600',
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const [member, transactions, dispensing] = await Promise.all([
    getMember(id),
    getMemberTransactions(id),
    getMemberDispensingTotals(id),
  ])

  if (!member) {
    notFound()
  }

  const tr = getTranslations(locale as Locale)

  const isExpired = new Date(member.membership_end) < new Date()
  const effectiveStatus = isExpired && member.status === 'active' ? 'expired' : member.status

  const remainingToday = Math.max(0, member.daily_limit_grams - dispensing.today)
  const remainingMonth = Math.max(0, member.monthly_limit_grams - dispensing.month)

  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const dailyPct = Math.min(100, Math.round((dispensing.today / member.daily_limit_grams) * 100))
  const monthPct = Math.min(100, Math.round((dispensing.month / member.monthly_limit_grams) * 100))

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back link */}
      <Link
        href={`/${locale}/admin/members`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {tr['member.title']}
      </Link>

      {/* Member header card */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {/* Top: avatar + name + status */}
        <div className="flex items-center gap-4 px-6 py-5">
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
            effectiveStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
          }`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900">{member.full_name}</h1>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[effectiveStatus] ?? 'bg-zinc-100 text-zinc-500'}`}>
                {tr[`member.status.${effectiveStatus}`]}
              </span>
            </div>
            <div className="text-sm text-zinc-400 mt-0.5">
              {tr[`member.document.${member.document_type}`]} · {member.document_number}
            </div>
          </div>
        </div>

        {/* Membership dates */}
        <div className="border-t border-zinc-100 grid grid-cols-2 divide-x divide-zinc-100">
          <div className="px-6 py-3">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">{tr['member.membership_start']}</div>
            <div className="text-sm font-semibold text-zinc-700 tabular-nums mt-0.5">{member.membership_start}</div>
          </div>
          <div className="px-6 py-3">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider">{tr['member.membership_end']}</div>
            <div className={`text-sm font-semibold tabular-nums mt-0.5 ${isExpired ? 'text-red-500' : 'text-zinc-700'}`}>
              {member.membership_end}
            </div>
          </div>
        </div>

        {/* Dispensing stats */}
        <div className="border-t border-zinc-100 grid grid-cols-2 divide-x divide-zinc-100">
          {/* Today */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">{tr['member.dispensed_today']}</div>
              <span className="text-xs font-semibold text-zinc-700 tabular-nums">{dispensing.today}g / {member.daily_limit_grams}g</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyPct >= 100 ? 'bg-red-500' : dailyPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {tr['member.remaining_today']}: <span className="font-semibold text-zinc-600">{remainingToday}g</span>
            </div>
          </div>
          {/* Month */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">{tr['member.dispensed_month']}</div>
              <span className="text-xs font-semibold text-zinc-700 tabular-nums">{dispensing.month}g / {member.monthly_limit_grams}g</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  monthPct >= 100 ? 'bg-red-500' : monthPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${monthPct}%` }}
              />
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {tr['member.remaining_month']}: <span className="font-semibold text-zinc-600">{remainingMonth}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal */}
      <MemberRenew
        memberId={member.id}
        currentEnd={member.membership_end}
      />

      {/* Edit form */}
      <MemberForm
        mode="edit"
        memberId={member.id}
        initialData={{
          full_name: member.full_name,
          document_type: member.document_type,
          document_number: member.document_number,
          date_of_birth: member.date_of_birth,
          phone: member.phone,
          email: member.email,
          membership_start: member.membership_start,
          membership_end: member.membership_end,
          daily_limit_grams: member.daily_limit_grams,
          monthly_limit_grams: member.monthly_limit_grams,
          status: member.status,
          notes: member.notes,
        }}
      />

      {/* Transaction history */}
      <MemberHistory
        transactions={transactions}
        translations={tr}
      />
    </div>
  )
}
