import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getMembers } from '@/actions/members'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MemberStatusFilter } from '@/components/admin/member-status-filter'
import { MemberSearch } from '@/components/admin/member-search'

const VALID_STATUSES = ['active', 'expired', 'suspended'] as const

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active': return 'outline'
    case 'expired': return 'secondary'
    case 'suspended': return 'destructive'
    default: return 'outline'
  }
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr['member.title']}</h1>
        <Link href={`/${locale}/admin/members/new`}>
          <Button>{tr['member.create']}</Button>
        </Link>
      </div>

      {/* Search + Status filter */}
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

      {/* Members table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr['member.full_name']}</TableHead>
              <TableHead>{tr['member.document_number']}</TableHead>
              <TableHead>{tr['common.status']}</TableHead>
              <TableHead>{tr['member.membership_end']}</TableHead>
              <TableHead className="text-right">{tr['member.daily_limit']}</TableHead>
              <TableHead className="text-right">{tr['member.monthly_limit']}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {tr['common.no_results']}
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => {
                const isExpired = new Date(m.membership_end) < new Date()
                const effectiveStatus = isExpired && m.status === 'active' ? 'expired' : m.status

                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link
                        href={`/${locale}/admin/members/${m.id}`}
                        className="font-medium hover:underline"
                      >
                        {m.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.document_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(effectiveStatus)} className="text-xs">
                        {tr[`member.status.${effectiveStatus}`]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      <span className={isExpired ? 'text-red-600' : ''}>
                        {m.membership_end}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.daily_limit_grams}g
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.monthly_limit_grams}g
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {members.length} {tr['member.title'].toLowerCase()}
      </p>
    </div>
  )
}
