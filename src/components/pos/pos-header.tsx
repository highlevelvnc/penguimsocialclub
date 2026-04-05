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
    <header className="flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐧</span>
          <span className="text-sm font-bold tracking-tight text-zinc-900">{t('app.name')}</span>
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          POS
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-zinc-700">{staffName}</span>
        </div>
        <LanguageSwitcher currentLocale={locale} />
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-zinc-500 hover:text-zinc-900 h-7 px-2"
          onClick={handleLock}
        >
          🔒 {t('auth.lock_screen')}
        </Button>
      </div>
    </header>
  )
}
