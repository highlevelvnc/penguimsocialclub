'use client'

import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const localeLabels: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
}

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(newLocale: string | null) {
    if (!newLocale) return
    // Replace the locale segment in the current path
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <Select value={currentLocale} onValueChange={handleChange}>
      <SelectTrigger className="w-16 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeLabels[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
