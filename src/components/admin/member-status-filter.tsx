'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'

const STATUSES = [null, 'active', 'expired', 'suspended'] as const

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
}

interface Props {
  currentStatus: string | null
  currentSearch: string
  locale: string
}

export function MemberStatusFilter({ currentStatus, currentSearch, locale }: Props) {
  const t = useT()
  const router = useRouter()

  function handleFilter(status: string | null) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (currentSearch) params.set('q', currentSearch)
    const qs = params.toString()
    router.push(`/${locale}/admin/members${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => {
        const isActive = currentStatus === s
        const colorClass = s ? statusColors[s] : 'bg-zinc-900 text-white border-zinc-900'
        const inactiveClass = s
          ? 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
          : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'

        return (
          <button
            key={s ?? 'all'}
            type="button"
            onClick={() => handleFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              isActive ? colorClass : inactiveClass
            }`}
          >
            {s === null ? t('common.all') || 'Todos' : t(`member.status.${s}`)}
          </button>
        )
      })}
    </div>
  )
}
