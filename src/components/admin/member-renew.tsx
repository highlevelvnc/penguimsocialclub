'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { renewMembership } from '@/actions/members'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Props {
  memberId: string
  currentEnd: string
}

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export function MemberRenew({ memberId, currentEnd }: Props) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newEnd, setNewEnd] = useState(addOneYear(currentEnd))

  async function handleRenew() {
    setLoading(true)

    const result = await renewMembership(memberId, newEnd)

    setLoading(false)

    if (result.success) {
      toast.success('Membresía renovada')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('member.renew')}</h3>
      <div className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1">
          <Label className="text-xs text-zinc-400">
            Actual: <span className="tabular-nums font-medium text-zinc-600">{currentEnd}</span>
          </Label>
          <Input
            type="date"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
            min={currentEnd}
            className="tabular-nums"
          />
        </div>
        <button
          type="button"
          onClick={handleRenew}
          disabled={loading}
          className="h-10 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-emerald-500/20"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            t('member.renew')
          )}
        </button>
      </div>
    </div>
  )
}
