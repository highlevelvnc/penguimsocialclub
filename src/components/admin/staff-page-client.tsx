'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { toggleStaffActive } from '@/actions/staff'
import type { StaffUser } from '@/lib/supabase/types'
import { StaffForm } from './staff-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
      toast.success(currentActive ? 'Staff deactivated' : 'Staff activated')
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
        <StaffForm mode="create" onSuccess={handleFormSuccess} />
      </div>
    )
  }

  // Edit form
  if (typeof view === 'object' && 'edit' in view) {
    const s = view.edit
    return (
      <div className="max-w-lg">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr['staff.title']}</h1>
        <Button onClick={() => setView('create')}>
          {tr['staff.create']}
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr['staff.full_name']}</TableHead>
              <TableHead>{tr['staff.email']}</TableHead>
              <TableHead>{tr['staff.role']}</TableHead>
              <TableHead>{tr['common.status']}</TableHead>
              <TableHead>{tr['common.actions']}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {tr['common.no_results']}
                </TableCell>
              </TableRow>
            ) : (
              staff.map((s) => (
                <TableRow key={s.id} className={!s.active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.email ?? '\u2014'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.role === 'admin' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {tr[`staff.role.${s.role}`]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.active ? (
                      <Badge variant="outline" className="text-xs">
                        {tr['common.active']}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {tr['common.inactive']}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setView({ edit: s })}
                      >
                        {tr['common.edit']}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs ${s.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        onClick={() => handleToggleActive(s.id, s.active)}
                      >
                        {s.active ? tr['staff.deactivate'] : tr['common.active']}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
