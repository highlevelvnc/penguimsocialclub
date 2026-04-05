'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { Input } from '@/components/ui/input'

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
    <form onSubmit={handleSubmit} className="max-w-sm">
      <Input
        placeholder={t('common.search') + '...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  )
}
