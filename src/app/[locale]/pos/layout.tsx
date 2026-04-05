import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPinSession } from '@/lib/session'
import { PosHeader } from '@/components/pos/pos-header'

export default async function PosLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Don't protect the lock/PIN entry page
  const isLockPage = pathname.includes('/pos/lock')

  if (isLockPage) {
    return <>{children}</>
  }

  // Protect all other POS pages
  const session = await getPinSession()

  if (!session.staffUserId) {
    redirect(`/${locale}/pos/lock`)
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <PosHeader
        staffName={session.staffName}
        locale={locale}
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
