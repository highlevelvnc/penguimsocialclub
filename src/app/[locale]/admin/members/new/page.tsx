import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { MemberForm } from '@/components/admin/member-form'

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tr = getTranslations(locale as Locale)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/members`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {tr['member.title']}
        </Link>
      </div>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">{tr['member.create']}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{tr['member.title']}</p>
      </div>
      <MemberForm
        mode="create"
        defaultLimits={{ daily: 5, monthly: 60 }}
      />
    </div>
  )
}
