'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import Header from './components/Header'
import DashboardStats from './components/DashboardStats'
import SchoolsList from './components/SchoolsList'
import FlaggedSchoolsList from './components/FlaggedSchoolsList'
import AddSchoolModal from './components/AddSchoolModal'
import TransactionLogsModal from './components/TransactionLogsModal'
import DashboardShell from './components/DashboardShell'
import { useGetMyPaidSchoolsQuery, useGetSchoolNamesQuery, useGetFlaggedSchoolsQuery } from '../store/api/authApi'
import Link from 'next/link'
import { IoArrowForward, IoAddOutline, IoReceiptOutline } from 'react-icons/io5'

export default function DashboardPage() {
  const { school } = useAuth()
  const [lga, setLga] = useState('')
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false)
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false)

  useEffect(() => {
    if (school?.lga) {
      setLga(school.lga)
    }
  }, [school])

  const { data: schools = [], isLoading } = useGetSchoolNamesQuery(
    { lga, withAuth: true },
    { skip: !lga }
  )
  
  // const { data: Paidschools = [], isLoading: isPaidLoading } = useGetMyPaidSchoolsQuery();

  const { data: flaggedSchools = [], isLoading: isFlaggedLoading } = useGetFlaggedSchoolsQuery(
    { lga },
    { skip: !lga }
  )

  return (
    <div className='sm:p-4 p-2 bg-[#F3F3F3] min-h-screen relative w-full flex flex-col'>
      <Header schoolCount={schools.length} />
      
      <div className="flex-1 mt-4 sm:mt-6">
        <div className="max-w-7xl mx-auto">
          <DashboardShell active="schools">
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

          <div className="mb-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsTransactionsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              <IoReceiptOutline className="w-5 h-5" />
              Transaction Logs
            </button>
            <button
              type="button"
              onClick={() => setIsAddSchoolOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer"
            >
              <IoAddOutline className="w-5 h-5" />
              Add School
            </button>
          </div>

          {flaggedSchools.length > 0 && (
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange-900 mb-1">
                      Flagged Schools - Payment Required
                    </h3>
                    <p className="text-sm text-orange-800">
                      {flaggedSchools.length} {flaggedSchools.length === 1 ? 'school has' : 'schools have'} outstanding payment issues that need to be resolved
                    </p>
                  </div>
                </div>
              </div>
              <FlaggedSchoolsList schools={flaggedSchools} isLoading={isFlaggedLoading} />
            </div>
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
          {/* <pre>
            {JSON.stringify(Paidschools)}
          </pre> */}
          {/* <SchoolsList schools={Paidschools} isLoading={isPaidLoading} /> */}
          <SchoolsList schools={schools} isLoading={isLoading} />
          </DashboardShell>
        </div>
      </div>

      <AddSchoolModal isOpen={isAddSchoolOpen} onClose={() => setIsAddSchoolOpen(false)} />
      <TransactionLogsModal isOpen={isTransactionsOpen} onClose={() => setIsTransactionsOpen(false)} />
    </div>
  )
}
