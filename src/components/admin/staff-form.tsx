'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { createStaffUser, updateStaffUser } from '@/actions/staff'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface StaffFormProps {
  mode: 'create' | 'edit'
  staffId?: string
  initialData?: {
    full_name: string
    email: string | null
    role: 'admin' | 'attendant'
    active: boolean
  }
  onSuccess?: () => void
}

export function StaffForm({ mode, staffId, initialData, onSuccess }: StaffFormProps) {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState(initialData?.full_name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [role, setRole] = useState<'admin' | 'attendant'>(initialData?.role ?? 'attendant')
  const [pin, setPin] = useState('')
  const [active, setActive] = useState(initialData?.active ?? true)

  const emailRequired = role === 'admin'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let result: { success: true; id?: string } | { success: false; error: string }

    if (mode === 'create') {
      result = await createStaffUser({
        full_name: fullName,
        email: email || null,
        role,
        pin,
        active,
      })
    } else {
      result = await updateStaffUser(staffId!, {
        full_name: fullName,
        email: email || null,
        role,
        pin: pin || null, // empty = don't change
        active,
      })
    }

    setLoading(false)

    if (result.success) {
      toast.success(t(mode === 'create' ? 'toast.staff_created' : 'toast.staff_updated'))
      setPin('')
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${locale}/admin/staff`)
        router.refresh()
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-zinc-900">
          {mode === 'create' ? t('staff.create') : t('common.edit')}
        </h3>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="staff_name">{t('staff.full_name')}</Label>
            <Input
              id="staff_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus={mode === 'create'}
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>{t('staff.role')}</Label>
            <Select
              value={role}
              onValueChange={(val) => val && setRole(val as 'admin' | 'attendant')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendant">{t('staff.role.attendant')}</SelectItem>
                <SelectItem value="admin">{t('staff.role.admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="staff_email">
              {t('staff.email')}
              {emailRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="staff_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={emailRequired}
              placeholder={emailRequired ? t('staff.email_required_note') : t('common.optional')}
            />
            {emailRequired && (
              <p className="text-xs text-muted-foreground">
                {t('staff.email_required_note')}
              </p>
            )}
          </div>

          {/* PIN */}
          <div className="space-y-1.5">
            <Label htmlFor="staff_pin">
              {t('staff.pin')}
              {mode === 'edit' && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({t('staff.pin_keep_current')})
                </span>
              )}
            </Label>
            <Input
              id="staff_pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4,6}"
              minLength={4}
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required={mode === 'create'}
              placeholder={t('staff.pin_placeholder')}
              className="w-40"
            />
          </div>

          {/* Active */}
          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="staff_active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="staff_active">{t('common.active')}</Label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('common.loading')}
                </span>
              ) : (
                t('common.save')
              )}
            </button>
            <button
              type="button"
              className="h-10 rounded-xl border border-zinc-200 px-6 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all"
              onClick={() => router.back()}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
