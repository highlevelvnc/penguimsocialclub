'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

const navItems = [
  { key: 'nav.members', href: '/admin/members' },
  { key: 'nav.products', href: '/admin/products' },
  { key: 'nav.staff', href: '/admin/staff' },
  { key: 'nav.daily_close', href: '/admin/close' },
] as const

export function AdminSidebar({
  locale,
  staffName,
}: {
  locale: string
  staffName: string
}) {
  const t = useT()
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <aside className="flex w-56 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold">{t('app.name')}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              {t(item.key)}
            </Link>
          )
        })}

        {/* POS link */}
        <Link
          href={`/${locale}/pos/lock`}
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          {t('nav.pos')}
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate">
            {staffName}
          </span>
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          {t('auth.logout')}
        </Button>
      </div>
    </aside>
  )
}
