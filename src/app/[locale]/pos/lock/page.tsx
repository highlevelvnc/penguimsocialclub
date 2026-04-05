'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { validatePin } from '@/actions/auth'

export default function PosLockPage() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit)
      setError('')
    }
  }, [pin])

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (pin.length < 4) return
    setLoading(true)
    setError('')

    const result = await validatePin(pin)

    if (result.success) {
      router.push(`/${locale}/pos`)
      router.refresh()
    } else {
      setError(t('auth.invalid_pin'))
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPin('')
      setLoading(false)
    }
  }, [pin, locale, router, t])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 space-y-10">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-3xl">🐧</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('app.name')}</h1>
            <p className="mt-1 text-sm text-zinc-500">{t('auth.enter_pin')}</p>
          </div>
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-3 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/30'
                  : 'bg-zinc-700/50 border border-zinc-600/50'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        <div className="h-5 text-center">
          {error && (
            <p className="text-sm text-red-400 animate-in fade-in">{error}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="flex h-16 items-center justify-center rounded-xl bg-white/5 text-2xl font-medium text-white backdrop-blur-sm border border-white/10 transition-all duration-150 hover:bg-white/10 hover:border-white/20 active:scale-95 active:bg-white/15 disabled:opacity-30"
              onClick={() => handleDigit(digit)}
              disabled={loading}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="flex h-16 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-400 backdrop-blur-sm border border-white/10 transition-all duration-150 hover:bg-white/10 active:scale-95 disabled:opacity-30"
            onClick={handleBackspace}
            disabled={loading}
          >
            &#x232B;
          </button>
          <button
            type="button"
            className="flex h-16 items-center justify-center rounded-xl bg-white/5 text-2xl font-medium text-white backdrop-blur-sm border border-white/10 transition-all duration-150 hover:bg-white/10 hover:border-white/20 active:scale-95 active:bg-white/15 disabled:opacity-30"
            onClick={() => handleDigit('0')}
            disabled={loading}
          >
            0
          </button>
          <button
            type="button"
            className={`flex h-16 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-150 active:scale-95 ${
              pin.length >= 4
                ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'OK'
            )}
          </button>
        </div>

        {/* Admin link */}
        <div className="text-center pt-4">
          <a
            href={`/${locale}/login`}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {t('auth.login')} (Admin)
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
