import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { getDailySummary, isAlreadyClosed, getCloseHistory } from '@/actions/close'
import { DailyCloseSummary } from '@/components/admin/daily-close-summary'
import { DailyCloseHistory } from '@/components/admin/daily-close-history'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export default async function ClosePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)
  const today = todayISO()

  const [summary, alreadyClosed, history] = await Promise.all([
    getDailySummary(today),
    isAlreadyClosed(today),
    getCloseHistory(),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <DailyCloseSummary
        date={today}
        summary={summary}
        alreadyClosed={alreadyClosed}
      />

      <DailyCloseHistory
        closes={history}
        translations={tr}
      />
    </div>
  )
}
