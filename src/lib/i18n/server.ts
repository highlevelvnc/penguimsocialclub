import esLocale from './locales/es.json'
import enLocale from './locales/en.json'
import ptLocale from './locales/pt.json'
import type { Locale } from './config'

const locales: Record<Locale, Record<string, string>> = {
  es: esLocale,
  en: enLocale,
  pt: ptLocale,
}

export function getTranslations(locale: Locale): Record<string, string> {
  return locales[locale] ?? locales.es
}

export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  const translations = getTranslations(locale)
  let value = translations[key] ?? key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v)
    })
  }
  return value
}
