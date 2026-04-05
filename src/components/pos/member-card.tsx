'use client'

import { useT } from '@/lib/i18n/client'
import type { Member } from '@/lib/supabase/types'
import type { MemberLimits } from '@/lib/pos/limits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

  const isExpired = new Date(member.membership_end) < new Date()
  const effectiveStatus = isExpired && member.status === 'active' ? 'expired' : member.status

  return (
    <div className="rounded-lg border bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{member.full_name}</span>
          <Badge
            variant={effectiveStatus === 'active' ? 'outline' : 'destructive'}
            className="text-xs"
          >
            {t(`member.status.${effectiveStatus}`)}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onChangeMember}>
          {t('pos.change_member')}
        </Button>
      </div>

      {/* Limits grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border p-2 text-center">
          <div className="text-[11px] text-muted-foreground">{t('pos.remaining_today')}</div>
          <div className={`text-xl font-bold tabular-nums ${remainingDaily <= 0 ? 'text-red-600' : ''}`}>
            {remainingDaily}g
          </div>
          <div className="text-[11px] text-muted-foreground">
            {t('member.dispensed_today')}: {limits.dispensedToday}g / {limits.dailyLimit}g
          </div>
        </div>
        <div className="rounded border p-2 text-center">
          <div className="text-[11px] text-muted-foreground">{t('pos.remaining_month')}</div>
          <div className={`text-xl font-bold tabular-nums ${remainingMonthly <= 0 ? 'text-red-600' : ''}`}>
            {remainingMonthly}g
          </div>
          <div className="text-[11px] text-muted-foreground">
            {t('member.dispensed_month')}: {limits.dispensedMonth}g / {limits.monthlyLimit}g
          </div>
        </div>
      </div>

      {/* Last visit */}
      {lastVisit && (
        <div className="mt-2 text-xs text-muted-foreground">
          {t('member.last_visit')}: {lastVisit}
        </div>
      )}
    </div>
  )
}
