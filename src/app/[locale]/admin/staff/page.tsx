import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getStaffUsers } from '@/actions/staff'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StaffPageClient } from '@/components/admin/staff-page-client'

export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const staff = await getStaffUsers()

  return (
    <StaffPageClient
      staff={staff}
      translations={tr}
      locale={locale}
    />
  )
}
