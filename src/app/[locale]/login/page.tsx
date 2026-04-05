'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useT, useLocale } from '@/lib/i18n/client'

export default function LoginPage() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(t('auth.invalid_credentials'))
      setLoading(false)
      return
    }

    router.push(`/${locale}/admin`)
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-3xl">🐧</span>
          </div>
          <h1 className="text-xl font-bold text-white">{t('app.name')}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t('auth.login')}</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all"
                placeholder="admin@club.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-11 rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('common.loading')}
                </span>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>
        </div>

        {/* POS link */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          <a href={`/${locale}/pos/lock`} className="text-zinc-400 hover:text-white transition-colors">
            → {t('nav.pos')}
          </a>
        </p>
      </div>
    </div>
  )
}
