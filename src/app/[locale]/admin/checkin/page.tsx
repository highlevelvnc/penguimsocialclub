import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getActiveCheckIns, getOccupancyCount, getTodayCheckInCount } from '@/actions/checkin'
import { CheckInPageClient } from '@/components/admin/checkin-page-client'

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)

  const [activeCheckIns, occupancy, todayCount] = await Promise.all([
    getActiveCheckIns(),
    getOccupancyCount(),
    getTodayCheckInCount(),
  ])

  return (
    <CheckInPageClient
      activeCheckIns={activeCheckIns}
      occupancy={occupancy}
      todayCount={todayCount}
      translations={tr}
      locale={locale}
    />
  )
}
