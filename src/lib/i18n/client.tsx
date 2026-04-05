'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Locale } from './config'

interface TranslationContextValue {
  locale: Locale
  translations: Record<string, string>
}

const TranslationContext = createContext<TranslationContextValue>({
  locale: 'es',
  translations: {},
})

export function TranslationProvider({
  locale,
  staticTranslations,
  dynamicTranslations,
  children,
}: {
  locale: Locale
  staticTranslations: Record<string, string>
  dynamicTranslations?: Record<string, string>
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      locale,
      translations: { ...staticTranslations, ...dynamicTranslations },
    }),
    [locale, staticTranslations, dynamicTranslations]
  )

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useLocale(): Locale {
  return useContext(TranslationContext).locale
}

export function useT() {
  const { translations } = useContext(TranslationContext)

  return function t(key: string, params?: Record<string, string>): string {
    let value = translations[key] ?? key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v)
      })
    }
    return value
  }
}
