import { notFound } from 'next/navigation'
import {
  getMember,
  getMemberTransactions,
  getMemberDispensingTotals,
} from '@/actions/members'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MemberForm } from '@/components/admin/member-form'
import { MemberRenew } from '@/components/admin/member-renew'
import { MemberHistory } from '@/components/admin/member-history'

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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Summary card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{member.full_name}</CardTitle>
            <Badge
              variant={effectiveStatus === 'active' ? 'outline' : effectiveStatus === 'suspended' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {tr[`member.status.${effectiveStatus}`]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">{tr['member.document_type']}: </span>
              {tr[`member.document.${member.document_type}`]}
            </div>
            <div>
              <span className="text-muted-foreground">{tr['member.document_number']}: </span>
              {member.document_number}
            </div>
            <div>
              <span className="text-muted-foreground">{tr['member.membership_start']}: </span>
              {member.membership_start}
            </div>
            <div>
              <span className="text-muted-foreground">{tr['member.membership_end']}: </span>
              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                {member.membership_end}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Dispensing summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <div className="text-xs text-muted-foreground">{tr['member.dispensed_today']}</div>
              <div className="text-xl font-bold tabular-nums">{dispensing.today}g</div>
              <div className="text-xs text-muted-foreground">
                {tr['member.remaining_today']}: <span className="font-medium">{remainingToday}g</span>
              </div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-xs text-muted-foreground">{tr['member.dispensed_month']}</div>
              <div className="text-xl font-bold tabular-nums">{dispensing.month}g</div>
              <div className="text-xs text-muted-foreground">
                {tr['member.remaining_month']}: <span className="font-medium">{remainingMonth}g</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
