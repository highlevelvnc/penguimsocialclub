import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getMembers } from '@/actions/members'
import { MemberStatusFilter } from '@/components/admin/member-status-filter'
import { MemberSearch } from '@/components/admin/member-search'

export const metadata: Metadata = { title: 'Members | Penguin' }

const VALID_STATUSES = ['active', 'expired', 'suspended'] as const

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  expired: 'bg-zinc-100 text-zinc-500',
  suspended: 'bg-red-50 text-red-600',
}

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { locale } = await params
  const { q: searchQuery, status: statusParam } = await searchParams
  const tr = getTranslations(locale as Locale)

  const statusFilter = statusParam && VALID_STATUSES.includes(statusParam as typeof VALID_STATUSES[number])
    ? (statusParam as 'active' | 'expired' | 'suspended')
    : undefined

  const members = await getMembers({
    search: searchQuery,
    status: statusFilter,
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{tr['member.title']}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {members.length} {tr['member.title'].toLowerCase()}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/members/new`}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {tr['member.create']}
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MemberSearch
          currentSearch={searchQuery ?? ''}
          currentStatus={statusFilter ?? null}
          locale={locale}
        />
        <MemberStatusFilter
          currentStatus={statusFilter ?? null}
          currentSearch={searchQuery ?? ''}
          locale={locale}
        />
      </div>

      {/* Members list */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {members.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">👤</span>
            <p className="mt-2 text-sm text-zinc-400">{tr['common.no_results']}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['member.full_name']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{tr['common.status']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-right">{tr['member.membership_end']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-right">{tr['member.daily_limit']}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 text-right">{tr['member.monthly_limit']}</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-50">
              {members.map((m) => {
                const isExpired = new Date(m.membership_end) < new Date()
                const effectiveStatus = isExpired && m.status === 'active' ? 'expired' : m.status
                const initials = m.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <Link
                    key={m.id}
                    href={`/${locale}/admin/members/${m.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-zinc-50/70 transition-colors"
                  >
                    {/* Name + doc */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        effectiveStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900 truncate">{m.full_name}</div>
                        <div className="text-[11px] text-zinc-400">{m.document_number}</div>
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[effectiveStatus] ?? 'bg-zinc-100 text-zinc-500'}`}>
                      {tr[`member.status.${effectiveStatus}`]}
                    </span>

                    {/* Membership end */}
                    <div className={`text-right text-xs tabular-nums font-medium ${isExpired ? 'text-red-500' : 'text-zinc-500'}`}>
                      {m.membership_end}
                    </div>

                    {/* Daily limit */}
                    <div className="text-right text-xs tabular-nums text-zinc-600 font-medium">
                      {m.daily_limit_grams}g
                    </div>

                    {/* Monthly limit */}
                    <div className="text-right text-xs tabular-nums text-zinc-600 font-medium">
                      {m.monthly_limit_grams}g
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
