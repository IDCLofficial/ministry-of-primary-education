'use client'

import { FaChartBar, FaChartLine, FaUsers, FaTrophy } from 'react-icons/fa'
import ExamApplicationsTable from '../components/ExamApplicationsTable'
import { useGetApplicationsQuery } from '@/app/admin/schools/store/api/schoolsApi'

export default function UbeatPage() {
  const { data: applicationsResponse } = useGetApplicationsQuery({
    examType: 'UBEAT',
    limit: 100
  })

  const applications = applicationsResponse?.data || []
  const totalStudents = applications.reduce((sum, app) => sum + app.numberOfStudents, 0)
  const approvedApplications = applications.filter(app => app.applicationStatus === 'approved').length
  const pendingApplications = applications.filter(app => app.applicationStatus === 'pending').length
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaChartBar className="text-green-600" />
          UBEAT Management
        </h1>
        <p className="text-gray-600 mt-2">
          Universal Basic Education Achievement Test - Monitor and manage UBEAT assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</p>
            </div>
            <FaChartBar className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
            </div>
            <FaUsers className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{approvedApplications}</p>
            </div>
            <FaChartLine className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingApplications}</p>
            </div>
            <FaTrophy className="text-3xl text-yellow-500" />
          </div>
        </div>
      </div>

      <ExamApplicationsTable examType="UBEAT" />
    </div>
  )
}
