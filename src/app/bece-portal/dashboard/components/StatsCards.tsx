'use client'
import React from 'react'
import { IoArrowUp } from 'react-icons/io5'

interface StatCardProps {
  title: string
  value: string | number,
  bgColor?: string,
  icon?: React.ReactNode
}

function StatCard({ title, value, icon, bgColor='#fcf1e5' }: StatCardProps) {

  return (
    <div 
      className="p-6 rounded-xl shadow-lg shadow-black/[0.01] border border-black/5" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-center gap-1">
          {icon && <IoArrowUp className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function StatsCards() {
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '12% than last year',
      bgColor: '#fcf1e5',
      trend: 'up' as const
    },
    {
      title: 'Results Uploaded',
      value: '1,203',
      change: '8% than last month',
      bgColor: '#ebf0fe',
      trend: 'up' as const
    },
    {
      title: 'Certificates Generated',
      value: '856',
      change: '15% than last month',
      bgColor: '#ecf5f4',
      trend: 'up' as const
    },
    {
      title: 'Pending Reviews',
      value: '47',
      change: '3% than last week',
      bgColor: '#ecf5e7',
      trend: 'down' as const
    }
  ]

  return (
    <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] grid-cols-1 gap-3">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  )
}
