import React from 'react'
import WelcomeText from './upload-ca/components/WelcomeText'
import StatsCards from './components/StatsCards'
import RecentActivities from './components/RecentActivities'
import QuickActions from './components/QuickActions'

export default function BeceDashboardPage() {
  return (
    <div className='p-6 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 h-full overflow-y-auto space-y-6'>
      {/* Welcome Section */}
      <WelcomeText />

      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activities */}
      <RecentActivities />
    </div>
  )
}