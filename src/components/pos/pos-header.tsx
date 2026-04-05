'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { lockPos } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'

export function PosHeader({
  staffName,
  locale,
}: {
  staffName: string
  locale: string
}) {
  const t = useT()
  const router = useRouter()

  async function handleLock() {
    await lockPos()
    router.push(`/${locale}/pos/lock`)
    router.refresh()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{t('app.name')}</span>
        <span className="text-sm text-muted-foreground">{t('nav.pos')}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{staffName}</span>
        <LanguageSwitcher currentLocale={locale} />
        <Button variant="outline" size="sm" onClick={handleLock}>
          {t('auth.lock_screen')}
        </Button>
      </div>
    </header>
  )
}
