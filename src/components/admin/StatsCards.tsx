'use client'

import { useEffect, useState } from 'react'
import CountUp from 'react-countup'

interface StatCardProps {
  title: string
  value: number
  color: string
  delay?: number
}

function StatCard({ title, value, color, delay = 0 }: StatCardProps) {
  const [startAnimation, setStartAnimation] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-sm font-bold ${color}`}>
            {startAnimation ? (
              <CountUp
                start={0}
                end={value}
                duration={2}
                separator=","
              />
            ) : (
              '0'
            )}
          </p>
        </div>
       
      </div>
    </div>
  )
}

export default function StatsCards() {
  const stats = [
    {
      title: 'Total Schools Registered',
      value: 1420,
      color: 'text-blue-600'
    },
    {
      title: 'Total Approved',
      value: 1250,
      color: 'text-blue-600'
    },
    {
      title: 'Total Students Onboarded',
      value: 55200,
      color: 'text-blue-600'
    },
    {
      title: 'Total Payments Collected',
      value: 110400000,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          color={stat.color}
          delay={index * 200}
        />
      ))}
    </div>
  )
}
