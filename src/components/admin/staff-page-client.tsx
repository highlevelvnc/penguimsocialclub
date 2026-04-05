'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { toggleStaffActive } from '@/actions/staff'
import type { StaffUser } from '@/lib/supabase/types'
import { StaffForm } from './staff-form'
import { toast } from 'sonner'

type ViewMode = 'list' | 'create' | { edit: StaffUser }

interface Props {
  staff: StaffUser[]
  translations: Record<string, string>
  locale: string
}

export function StaffPageClient({ staff, translations: tr, locale }: Props) {
  const t = useT()
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('list')

  async function handleToggleActive(id: string, currentActive: boolean) {
    const result = await toggleStaffActive(id, !currentActive)
    if (result.success) {
      toast.success(currentActive ? 'Staff deactivado' : 'Staff activado')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleFormSuccess() {
    setView('list')
    router.refresh()
  }

  // Create form
  if (view === 'create') {
    return (
      <div className="max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {tr['common.cancel']}
          </button>
        </div>
        <StaffForm mode="create" onSuccess={handleFormSuccess} />
      </div>
    )
  }

  // Edit form
  if (typeof view === 'object' && 'edit' in view) {
    const s = view.edit
    return (
      <div className="max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {tr['common.cancel']}
          </button>
        </div>
        <StaffForm
          mode="edit"
          staffId={s.id}
          initialData={{
            full_name: s.full_name,
            email: s.email,
            role: s.role,
            active: s.active,
          }}
          onSuccess={handleFormSuccess}
        />
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{tr['staff.title']}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{staff.length} {staff.length === 1 ? 'persona' : 'personas'}</p>
        </div>
        <button
          type="button"
          onClick={() => setView('create')}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {tr['staff.create']}
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {staff.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">👤</span>
            <p className="mt-2 text-sm text-zinc-400">{tr['common.no_results']}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {staff.map((s) => {
              const initials = s.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50/50 ${!s.active ? 'opacity-50' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">{s.full_name}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        s.role === 'admin'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {tr[`staff.role.${s.role}`]}
                      </span>
                      {!s.active && (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {tr['common.inactive']}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{s.email ?? '—'}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                      onClick={() => setView({ edit: s })}
                    >
                      {tr['common.edit']}
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        s.active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      onClick={() => handleToggleActive(s.id, s.active)}
                    >
                      {s.active ? tr['staff.deactivate'] : tr['common.active']}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
