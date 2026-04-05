'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { createMember, updateMember, type MemberFormData } from '@/actions/members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      toast.success(mode === 'create' ? 'Member created' : 'Member updated')
      if (mode === 'create' && 'id' in result) {
        router.push(`/${locale}/admin/members/${result.id}`)
      }
      router.refresh()
    } else {
      toast.error(translateError(result.error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? t('member.create') : t('common.edit')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">{t('member.full_name')}</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus={mode === 'create'}
            />
          </div>

          {/* Document type + number */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t('member.document_type')}</Label>
              <Select
                value={documentType}
                onValueChange={(val) => val && setDocumentType(val as 'dni' | 'nie' | 'passport')}
              >
                <SelectTrigger className="w-full">
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
              <Label htmlFor="doc_number">{t('member.document_number')}</Label>
              <Input
                id="doc_number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date of birth */}
          <div className="space-y-1.5">
            <Label htmlFor="dob">{t('member.date_of_birth')}</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              max={todayISO()}
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('member.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('member.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Membership dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mem_start">{t('member.membership_start')}</Label>
              <Input
                id="mem_start"
                type="date"
                value={membershipStart}
                onChange={(e) => setMembershipStart(e.target.value)}
                required
                disabled={mode === 'edit'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mem_end">{t('member.membership_end')}</Label>
              <Input
                id="mem_end"
                type="date"
                value={membershipEnd}
                onChange={(e) => setMembershipEnd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dispensing limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="daily_limit">{t('member.daily_limit')}</Label>
              <Input
                id="daily_limit"
                type="number"
                step="0.5"
                min="0.5"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthly_limit">{t('member.monthly_limit')}</Label>
              <Input
                id="monthly_limit"
                type="number"
                step="1"
                min="1"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>{t('common.status')}</Label>
            <Select
              value={status}
              onValueChange={(val) => val && setStatus(val as 'active' | 'expired' | 'suspended')}
            >
              <SelectTrigger className="w-full">
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

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('member.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('common.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
