'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import Header from './components/Header'
import DashboardStats from './components/DashboardStats'
import SchoolsList from './components/SchoolsList'
import { useGetSchoolNamesQuery } from '../store/api/authApi'
import Link from 'next/link'
import { IoArrowForward } from 'react-icons/io5'

export default function DashboardPage() {
  const { school } = useAuth()
  const [lga, setLga] = useState('')

  useEffect(() => {
    if (school?.lga) {
      setLga(school.lga)
    }
  }, [school])

  const { data: schools = [], isLoading } = useGetSchoolNamesQuery(
    { lga },
    { skip: !lga }
  )

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <Header schoolCount={schools.length} />
      
      <div className="flex-1 mt-4 sm:mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600">
              Here's an overview of your LGA and schools
            </p>
          </div>

          {school && (
            <DashboardStats
              lga={school.lga}
              totalSchools={schools.length}
            />
          )}

          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Select a School</h3>
                  <p className="text-sm text-gray-600">Click on any school below to view and manage their examination portals</p>
                </div>
              </div>
            </div>
          </div>

          <SchoolsList schools={schools} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
