'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'

interface Props {
  currentSearch: string
  currentStatus: string | null
  locale: string
}

export function MemberSearch({ currentSearch, currentStatus, locale }: Props) {
  const t = useT()
  const router = useRouter()
  const [value, setValue] = useState(currentSearch)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (value.trim()) params.set('q', value.trim())
    if (currentStatus) params.set('status', currentStatus)
    const qs = params.toString()
    router.push(`/${locale}/admin/members${qs ? `?${qs}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        placeholder={t('common.search') + '...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition-all"
      />
    </form>
  )
}
