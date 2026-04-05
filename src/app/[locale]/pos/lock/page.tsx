'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLocale } from '@/lib/i18n/client'
import { validatePin } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default function PosLockPage() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      setPin('')
      setLoading(false)
    }
  }, [pin, locale, router, t])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white">
      <div className="w-full max-w-xs space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('app.name')}</h1>
          <p className="mt-2 text-zinc-400">{t('auth.enter_pin')}</p>
        </div>

        {/* PIN display */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full ${
                i < pin.length ? 'bg-white' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className="h-16 text-2xl font-semibold bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              onClick={() => handleDigit(digit)}
              disabled={loading}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-16 text-sm bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
            onClick={handleBackspace}
            disabled={loading}
          >
            {'\u232B'}
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            onClick={() => handleDigit('0')}
            disabled={loading}
          >
            0
          </Button>
          <Button
            className="h-16 text-sm font-semibold"
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
          >
            {loading ? '...' : 'OK'}
          </Button>
        </div>

        {/* Admin login link */}
        <div className="text-center">
          <a
            href={`/${locale}/login`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            {t('auth.login')} (Admin)
          </a>
        </div>
      </div>
    </div>
  )
}
