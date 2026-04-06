import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { ReportPageClient } from '@/components/admin/report-page-client'

export const metadata: Metadata = { title: 'Reports | Penguin' }

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)

  return (
    <ReportPageClient translations={tr} locale={locale} />
  )
}
