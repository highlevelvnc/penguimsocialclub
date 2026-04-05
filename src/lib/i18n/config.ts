export const defaultLocale = 'es' as const
export const locales = ['es', 'en', 'pt'] as const
export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
