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

interface SchoolData {
  _id: string
  schoolName: string
  status: string
  students: any[]
  studentsPaidFor?: number
  studentsOnboarded?: number
  totalPoints?: number
  availablePoints?: number
}

export default function StatsCards() {
  const [stats, setStats] = useState([
    {
      title: 'Total Schools Registered',
      value: 0,
      color: 'text-blue-600'
    },
    {
      title: 'Total Approved',
      value: 0,
      color: 'text-blue-600'
    },
    {
      title: 'Total Students Onboarded',
      value: 0,
      color: 'text-blue-600'
    },
    {
      title: 'Total Payments Collected',
      value: 0,
      color: 'text-blue-600'
    }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/schools')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const schools: SchoolData[] = await response.json()
        
        // Calculate statistics from real data
        const totalSchools = schools.length
        const totalApproved = schools.filter(school => school.status === 'approved').length
        const totalStudentsOnboarded = schools.reduce((sum, school) => {
          return sum + (school.students?.filter((s: any) => s.onboardingStatus === 'Onboarded')?.length || school.studentsOnboarded || 0)
        }, 0)
        const totalPayments = schools.reduce((sum, school) => {
          const paidStudents = school.students?.filter((s: any) => s.paymentStatus === 'Paid')?.length || school.studentsPaidFor || 0
          return sum + (paidStudents * 2000) // Assuming 2000 per student payment
        }, 0)

        setStats([
          {
            title: 'Total Schools Registered',
            value: totalSchools,
            color: 'text-blue-600'
          },
          {
            title: 'Total Approved',
            value: totalApproved,
            color: 'text-green-600'
          },
          {
            title: 'Total Students Onboarded',
            value: totalStudentsOnboarded,
            color: 'text-purple-600'
          },
          {
            title: 'Total Payments Collected',
            value: totalPayments,
            color: 'text-orange-600'
          }
        ])
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

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
