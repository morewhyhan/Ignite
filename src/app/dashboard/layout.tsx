import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { auth } from '@/server/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
