'use client'

import { useT, useLocale } from '@/lib/i18n/client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useT()
  const locale = useLocale()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{t('error.title')}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t('error.description')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            {t('error.retry')}
          </button>
          <a
            href={`/${locale}/pos/lock`}
            className="h-11 w-full rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all flex items-center justify-center"
          >
            {t('error.go_home')}
          </a>
        </div>
      </div>
    </div>
  )
}
