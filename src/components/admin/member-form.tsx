'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { createMember, updateMember, type MemberFormData } from '@/actions/members'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const DOCUMENT_TYPES = ['dni', 'nie', 'passport'] as const
const MEMBER_STATUSES = ['active', 'expired', 'suspended'] as const

interface MemberFormProps {
  mode: 'create' | 'edit'
  memberId?: string
  initialData?: {
    full_name: string
    document_type: 'dni' | 'nie' | 'passport'
    document_number: string
    document_expiry: string | null
    date_of_birth: string
    phone: string | null
    email: string | null
    membership_start: string
    membership_end: string
    daily_limit_grams: number
    monthly_limit_grams: number
    status: 'active' | 'expired' | 'suspended'
    notes: string | null
  }
  defaultLimits?: {
    daily: number
    monthly: number
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function oneYearFromNow(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export function MemberForm({ mode, memberId, initialData, defaultLimits }: MemberFormProps) {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState(initialData?.full_name ?? '')
  const [documentType, setDocumentType] = useState<'dni' | 'nie' | 'passport'>(initialData?.document_type ?? 'dni')
  const [documentNumber, setDocumentNumber] = useState(initialData?.document_number ?? '')
  const [documentExpiry, setDocumentExpiry] = useState(initialData?.document_expiry ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [membershipStart, setMembershipStart] = useState(initialData?.membership_start ?? todayISO())
  const [membershipEnd, setMembershipEnd] = useState(initialData?.membership_end ?? oneYearFromNow())
  const [dailyLimit, setDailyLimit] = useState(
    (initialData?.daily_limit_grams ?? defaultLimits?.daily ?? 5).toString()
  )
  const [monthlyLimit, setMonthlyLimit] = useState(
    (initialData?.monthly_limit_grams ?? defaultLimits?.monthly ?? 60).toString()
  )
  const [status, setStatus] = useState<'active' | 'expired' | 'suspended'>(initialData?.status ?? 'active')
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  function translateError(code: string): string {
    switch (code) {
      case 'UNDERAGE': return t('member.error.underage')
      case 'DUPLICATE_DOCUMENT': return t('member.error.duplicate_document')
      default: return code
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData: MemberFormData = {
      full_name: fullName,
      document_type: documentType,
      document_number: documentNumber,
      document_expiry: documentExpiry || null,
      date_of_birth: dateOfBirth,
      phone: phone || null,
      email: email || null,
      membership_start: membershipStart,
      membership_end: membershipEnd,
      daily_limit_grams: parseFloat(dailyLimit) || 5,
      monthly_limit_grams: parseFloat(monthlyLimit) || 60,
      status,
      notes: notes || null,
    }

    const result = mode === 'create'
      ? await createMember(formData)
      : await updateMember(memberId!, formData)

    setLoading(false)

    if (result.success) {
      toast.success(t(mode === 'create' ? 'toast.member_created' : 'toast.member_updated'))
      if (mode === 'create' && 'id' in result) {
        router.push(`/${locale}/admin/members/${result.id}`)
      }
      router.refresh()
    } else {
      toast.error(translateError(result.error))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Section: Personal data */}
      <FormSection title={t('form.section.personal')} icon="👤">
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-xs text-zinc-500">{t('member.full_name')}</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus={mode === 'create'}
              className="h-10"
            />
          </div>

          {/* Document type + number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">{t('member.document_type')}</Label>
              <Select
                value={documentType}
                onValueChange={(val) => val && setDocumentType(val as 'dni' | 'nie' | 'passport')}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt} value={dt}>
                      {t(`member.document.${dt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="doc_number" className="text-xs text-zinc-500">{t('member.document_number')}</Label>
              <Input
                id="doc_number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
                className="h-10 uppercase"
              />
            </div>
          </div>

          {/* Document expiry */}
          <div className="space-y-1.5">
            <Label htmlFor="doc_expiry" className="text-xs text-zinc-500">{t('member.document_expiry')}</Label>
            <Input
              id="doc_expiry"
              type="date"
              value={documentExpiry}
              onChange={(e) => setDocumentExpiry(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Date of birth */}
          <div className="space-y-1.5">
            <Label htmlFor="dob" className="text-xs text-zinc-500">{t('member.date_of_birth')}</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              max={todayISO()}
              className="h-10"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-zinc-500">{t('member.phone')}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-500">{t('member.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section: Membership */}
      <FormSection title={t('form.section.membership')} icon="📅">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem_start" className="text-xs text-zinc-500">{t('member.membership_start')}</Label>
              <Input
                id="mem_start"
                type="date"
                value={membershipStart}
                onChange={(e) => setMembershipStart(e.target.value)}
                required
                disabled={mode === 'edit'}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mem_end" className="text-xs text-zinc-500">{t('member.membership_end')}</Label>
              <Input
                id="mem_end"
                type="date"
                value={membershipEnd}
                onChange={(e) => setMembershipEnd(e.target.value)}
                required
                className="h-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500">{t('common.status')}</Label>
            <Select
              value={status}
              onValueChange={(val) => val && setStatus(val as 'active' | 'expired' | 'suspended')}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`member.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      {/* Section: Dispensing limits */}
      <FormSection title={t('form.section.limits')} icon="🌿">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="daily_limit" className="text-xs text-zinc-500">{t('member.daily_limit')}</Label>
            <div className="relative">
              <Input
                id="daily_limit"
                type="number"
                step="0.5"
                min="0.5"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                required
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthly_limit" className="text-xs text-zinc-500">{t('member.monthly_limit')}</Label>
            <div className="relative">
              <Input
                id="monthly_limit"
                type="number"
                step="1"
                min="1"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
                className="h-10 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs text-zinc-500">{t('member.notes')}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          placeholder={t('form.notes_placeholder')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
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
          className="h-11 rounded-xl border border-zinc-200 px-6 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all"
          onClick={() => router.back()}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
