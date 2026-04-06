import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { getLowStockCount } from '@/actions/stock-alerts'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Verify Supabase Auth session
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect(`/${locale}/login`)
  }

  // Verify user is admin in staff_users
  const adminClient = createAdminClient()
  const { data: staffUser } = await adminClient
    .from('staff_users')
    .select('id, full_name, role')
    .eq('email', user.email)
    .eq('shop_id', SHOP_ID)
    .eq('active', true)
    .eq('role', 'admin')
    .single()

  if (!staffUser) {
    redirect(`/${locale}/login`)
  }

  // Fetch low stock count for sidebar badge
  const lowStockCount = await getLowStockCount()

  return (
    <div className="flex h-screen">
      <AdminSidebar
        locale={locale}
        staffName={(staffUser as { full_name: string }).full_name}
        lowStockCount={lowStockCount}
      />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-zinc-50 via-white to-zinc-50/80 p-6">
        {children}
      </main>
    </div>
  )
}
