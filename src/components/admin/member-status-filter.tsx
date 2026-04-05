'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'

const STATUSES = [null, 'active', 'expired', 'suspended'] as const

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
      {STATUSES.map((s) => (
        <Button
          key={s ?? 'all'}
          variant={currentStatus === s ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter(s)}
        >
          {s === null ? 'All' : t(`member.status.${s}`)}
        </Button>
      ))}
    </div>
  )
}
