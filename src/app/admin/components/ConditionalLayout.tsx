'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '../schools/components/DashboardLayout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Don't show DashboardLayout on login page
  if (pathname === '/admin/systemlogin') {
    return <>{children}</>
  }
  
  // Show DashboardLayout for all other admin pages
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
