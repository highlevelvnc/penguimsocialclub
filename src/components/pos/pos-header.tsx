'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { lockPos } from '@/actions/auth'

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

  const initials = staffName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-zinc-800/60 bg-zinc-900/80 px-4 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Penguin Social Club"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="text-sm font-semibold tracking-tight text-zinc-200">
          Penguin Social Club
        </span>
        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          POS
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Staff */}
        <div className="flex items-center gap-2 rounded-full bg-zinc-800/60 px-2.5 py-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">
            {initials}
          </div>
          <span className="text-xs font-medium text-zinc-300">{staffName}</span>
        </div>

        {/* Lock */}
        <button
          type="button"
          onClick={handleLock}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          {t('auth.lock_screen')}
        </button>
      </div>
    </header>
  )
}
