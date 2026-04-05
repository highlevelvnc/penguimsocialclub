import { notFound } from 'next/navigation'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/server'
import { TranslationProvider } from '@/lib/i18n/client'
import { Toaster } from '@/components/ui/sonner'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isValidLocale(locale)) {
    notFound()
  }

  const staticTranslations = getTranslations(locale as Locale)

  // TODO: Load dynamic translations from DB for subcategory labels
  const dynamicTranslations: Record<string, string> = {}

  return (
    <TranslationProvider
      locale={locale as Locale}
      staticTranslations={staticTranslations}
      dynamicTranslations={dynamicTranslations}
    >
      {children}
      <Toaster position="top-right" />
    </TranslationProvider>
  )
}
