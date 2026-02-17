'use client'
import React from 'react'
import { useGetDashboardSummaryQuery } from '../../store/api/authApi'

interface StatCardProps {
  title: string
  value: string | number,
  bgColor?: string,
  isLoading?: boolean
}

function StatCard({ title, value, bgColor='#fcf1e5', isLoading }: StatCardProps) {
  return (
    <div 
      className="p-6 rounded-xl shadow-lg shadow-black/[0.01] border border-black/5" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatsCards() {
  const { data, isLoading } = useGetDashboardSummaryQuery()

  const stats = [
    {
      title: 'Total Students',
      value: data?.students || 0,
      bgColor: '#fcf1e5',
    },
    {
      title: 'Results Uploaded',
      value: data?.resultUploaded || 0,
      bgColor: '#ebf0fe',
    },
    {
      title: 'Total Schools',
      value: data?.totalSchools || 0,
      bgColor: '#ecf5f4',
    },
    {
      title: 'Certificates Generated',
      value: data?.certificateGenerated || 0,
      bgColor: '#ecf5e7',
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
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
