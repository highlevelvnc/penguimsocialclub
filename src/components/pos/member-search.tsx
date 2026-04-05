'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useT } from '@/lib/i18n/client'
import { createClient } from '@/lib/supabase/client'
import { SHOP_ID } from '@/lib/constants'
import type { Member } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Props {
  onSelect: (member: Member) => void
}

export function PosMemberSearch({ onSelect }: Props) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Member[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('shop_id', SHOP_ID)
      .or(`full_name.ilike.%${q}%,document_number.ilike.${q}%`)
      .order('full_name')
      .limit(8)

    const members = (data as Member[] | null) ?? []
    setResults(members)
    setOpen(members.length > 0)
    setLoading(false)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 150)
  }

  function handleSelect(member: Member) {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(member)
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-700'
      case 'expired': return 'text-red-600'
      case 'suspended': return 'text-amber-600'
      default: return ''
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder={t('pos.search_member')}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="h-12 text-lg"
      />
      {loading && (
        <div className="absolute right-3 top-3.5 text-xs text-muted-foreground">
          ...
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-white shadow-lg">
          {results.map((member) => {
            const isExpired = new Date(member.membership_end) < new Date()
            const effectiveStatus = isExpired && member.status === 'active' ? 'expired' : member.status
            const blocked = effectiveStatus !== 'active'

            return (
              <button
                key={member.id}
                type="button"
                className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 first:rounded-t-lg last:rounded-b-lg ${
                  blocked ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  if (!blocked) handleSelect(member)
                }}
                disabled={blocked}
              >
                <div>
                  <div className="font-medium">{member.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.document_number}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={effectiveStatus === 'active' ? 'outline' : 'destructive'}
                    className="text-xs"
                  >
                    <span className={statusColor(effectiveStatus)}>
                      {t(`member.status.${effectiveStatus}`)}
                    </span>
                  </Badge>
                  {blocked && (
                    <span className="text-xs text-red-500">
                      {effectiveStatus === 'expired'
                        ? t('pos.error.membership_expired')
                        : t('pos.error.member_not_active')}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
