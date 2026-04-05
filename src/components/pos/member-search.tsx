'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useT } from '@/lib/i18n/client'
import { createClient } from '@/lib/supabase/client'
import { SHOP_ID } from '@/lib/constants'
import type { Member } from '@/lib/supabase/types'

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

  return (
    <div className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <label htmlFor="pos-member-search" className="sr-only">{t('pos.search_member')}</label>
        <input
          ref={inputRef}
          id="pos-member-search"
          type="text"
          placeholder={t('pos.search_member')}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          aria-label={t('pos.search_member')}
          className="w-full h-14 rounded-2xl border border-zinc-700 bg-zinc-800/80 pl-12 pr-4 text-base text-white placeholder:text-zinc-500 shadow-lg shadow-black/20 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all backdrop-blur-md"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-zinc-700 bg-zinc-800/95 shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-md">
          {results.map((member, idx) => {
            const isExpired = new Date(member.membership_end) < new Date()
            const effectiveStatus = isExpired && member.status === 'active' ? 'expired' : member.status
            const blocked = effectiveStatus !== 'active'
            const initials = member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

            return (
              <button
                key={member.id}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  blocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-500/10 cursor-pointer'
                } ${idx > 0 ? 'border-t border-zinc-700/50' : ''}`}
                onClick={() => { if (!blocked) handleSelect(member) }}
                disabled={blocked}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                  blocked
                    ? 'bg-zinc-700 text-zinc-500'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-100">{member.full_name}</div>
                  <div className="text-[11px] text-zinc-500">{member.document_number}</div>
                </div>
                <div className="flex-shrink-0">
                  {effectiveStatus === 'active' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {t('member.status.active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
                      {t(`member.status.${effectiveStatus}`)}
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
