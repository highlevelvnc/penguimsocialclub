'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/client'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

const navItems = [
  {
    key: 'dashboard.title',
    href: '/admin',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    exact: true,
  },
  {
    key: 'nav.members',
    href: '/admin/members',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: 'nav.products',
    href: '/admin/products',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    key: 'nav.staff',
    href: '/admin/staff',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    key: 'nav.daily_close',
    href: '/admin/close',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    key: 'checkin.title',
    href: '/admin/checkin',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
] as const

export function AdminSidebar({
  locale,
  staffName,
  lowStockCount = 0,
}: {
  locale: string
  staffName: string
  lowStockCount?: number
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

  const initials = staffName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-100 px-4">
        <span className="text-xl">🐧</span>
        <div className="leading-tight">
          <div className="text-sm font-bold text-zinc-900">{t('app.name')}</div>
          <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Admin</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = 'exact' in item && item.exact
            ? pathname === href || pathname === `${href}/`
            : pathname.startsWith(href) && item.href !== '/admin'
          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/5'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:translate-x-0.5'
              )}
            >
              <span className={isActive ? 'text-emerald-600' : 'text-zinc-400'}>
                {item.icon}
              </span>
              {t(item.key)}
              {/* Low stock badge on Products nav */}
              {item.href === '/admin/products' && lowStockCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                  {lowStockCount}
                </span>
              )}
              {isActive && !('exact' in item) && !(item.href === '/admin/products' && lowStockCount > 0) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-2 border-t border-zinc-100" />

        {/* POS link */}
        <Link
          href={`/${locale}/pos/lock`}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
        >
          <span className="text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </span>
          {t('nav.pos')}
          <span className="ml-auto text-[10px] font-medium text-zinc-400 bg-zinc-100 rounded px-1.5 py-0.5">POS</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 p-3 space-y-2">
        {/* Staff info */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-600">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-zinc-700 truncate">{staffName}</div>
            <div className="text-[10px] text-zinc-400">Admin</div>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  )
}
