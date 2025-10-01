'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { School, Student } from '@/services/schoolService'

// Application interface to match the data structure
interface Application {
  _id: string;
  school: {
    _id: string;
    schoolName: string;
    address: string;
    principal: string;
    email: string;
    students: Student[];
    status: string;
    isFirstLogin: boolean;
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  schoolName: string;
  address: string;
  schoolCode: string;
  principal: string;
  email: string;
  phone: number;
  numberOfStudents: number;
  applicationStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  reviewNotes?: string;
  reviewedAt?: string;
}

interface SchoolDetailViewProps {
  school: School | Application
  onBack: () => void
}

export default function SchoolDetailView({ school, onBack }: SchoolDetailViewProps) {
  console.log(school)
  
  // Determine if this is an Application or School
  const isApplication = 'applicationStatus' in school
  
  // Get the display data based on type
  const displayData = isApplication ? {
    _id: school._id,
    schoolName: school.schoolName,
    address: school.address,
    principal: school.principal,
    email: school.email,
    status: school.applicationStatus,
    students: school.school?.students || [],
    totalPoints: school.school?.totalPoints || 0,
    availablePoints: school.school?.availablePoints || 0,
    usedPoints: school.school?.usedPoints || 0,
    isFirstLogin: school.school?.isFirstLogin || true,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
    numberOfStudents: school.numberOfStudents,
    phone: school.phone,
    reviewNotes: (school as Application).reviewNotes,
    reviewedAt: (school as Application).reviewedAt
  } : school as School
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const prepareStudentData = () => {
    if (!displayData.students || displayData.students.length === 0) {
      return []
    }
    return displayData.students.map((student, index) => ({
      'S/N': index + 1,
      'Student Name': student.name || 'N/A',
      'Gender': student.gender || 'N/A',
      'Class': student.class || 'N/A',
      'Exam Year': student.examYear || 'N/A',
      'Payment Status': student.paymentStatus || 'Pending',
      'Onboarding Status': student.onboardingStatus || 'Not Onboarded'
    }))
  }

  const handleExportExcel = () => {
    const studentData = prepareStudentData()
    if (studentData.length === 0) {
      alert('No student data to export')
      return
    }
    const headers = Object.keys(studentData[0])
    const csvContent = [
      headers.join(','),
      ...studentData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${displayData.schoolName.replace(/\s+/g, '_')}_Students_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

  const handleExportPDF = async () => {
    const studentData = prepareStudentData()
    
    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Set font
      doc.setFont('helvetica')
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text(displayData.schoolName, 105, 20, { align: 'center' })
      
      doc.setFontSize(16)
      doc.text('Student List Report', 105, 30, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' })
      
      // School Info
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      let yPos = 55
      
      doc.text(`School ID: ${displayData._id}`, 20, yPos)
      yPos += 7
      doc.text(`Principal: ${displayData.principal || 'Not specified'}`, 20, yPos)
      yPos += 7
      doc.text(`Total Students: ${displayData.students?.length || 0}`, 20, yPos)
      yPos += 7
      doc.text(`Students Paid: ${displayData.students?.filter(s => s.paymentStatus === 'Paid').length || 0}`, 20, yPos)
      yPos += 7
      doc.text(`Students Onboarded: ${displayData.students?.filter(s => s.onboardingStatus === 'Onboarded').length || 0}`, 20, yPos)
      yPos += 15
      
      // Table headers
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      
      const headers = ['S/N', 'Student Name', 'Gender', 'Class', 'Exam Year', 'Payment', 'Onboarding']
      const columnWidths = [15, 45, 20, 20, 25, 25, 30]
      let xPos = 20
      
      // Draw header row
      doc.setFillColor(240, 240, 240)
      doc.rect(20, yPos - 5, 170, 10, 'F')
      
      headers.forEach((header, index) => {
        doc.text(header, xPos + 2, yPos)
        xPos += columnWidths[index]
      })
      
      yPos += 10
      doc.setFont('helvetica', 'normal')
      
      // Table data
      if (studentData.length > 0) {
        studentData.forEach((student, index) => {
          if (yPos > 270) { // Start new page if needed
            doc.addPage()
            yPos = 20
          }
          
          xPos = 20
          const rowData = [
            student['S/N'].toString(),
            student['Student Name'],
            student['Gender'],
            student['Class'],
            student['Exam Year'],
            student['Payment Status'],
            student['Onboarding Status']
          ]
          
          // Alternate row colors
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249)
            doc.rect(20, yPos - 5, 170, 8, 'F')
          }
          
          rowData.forEach((data, colIndex) => {
            // Truncate long text to fit column
            let text = data
            if (text.length > 15 && colIndex === 1) { // Student name column
              text = text.substring(0, 15) + '...'
            }
            doc.text(text, xPos + 2, yPos)
            xPos += columnWidths[colIndex]
          })
          
          yPos += 8
        })
      } else {
        doc.text('No student data available', 20, yPos)
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text('Ministry of Primary and Secondary Education - IMSG', 105, 285, { align: 'center' })
        doc.text('This report was generated automatically by the school management system.', 105, 290, { align: 'center' })
        doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' })
      }
      
      // Save the PDF
      const fileName = `${displayData.schoolName.replace(/\s+/g, '_')}_Students_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
    
    setShowExportMenu(false)
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!displayData.students || displayData.students.length === 0) {
      return []
    }
    return displayData.students.filter((student: Student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student._id?.includes(searchTerm) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [displayData.students, searchTerm])

  // Paginate students
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
Back to Schools
              </button>
            </div>
            <div className="flex space-x-3">
              <div className="relative" ref={exportMenuRef}>
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <span>Export Student List</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={handleExportExcel}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as Excel (.csv)
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
             
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* School Information Section */}
        <div className="bg-white rounded-lg shadow-sm mb-8 border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">School Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">School Name</label>
                  <p className="text-lg font-semibold text-gray-900">{displayData.schoolName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">School ID</label>
                  <p className="text-base text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">{displayData._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    displayData.status === 'approved' ? 'bg-green-100 text-green-800' :
                    displayData.status === 'onboarded' ? 'bg-blue-100 text-blue-800' :
                    displayData.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    displayData.status === 'declined' ? 'bg-red-100 text-red-800' :
                    displayData.status === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                    displayData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    displayData.status === 'not applied' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {displayData.status === 'not applied' ? 'Not Applied' : 
                     displayData.status === 'pending' ? 'Applied' :
                     displayData.status.charAt(0).toUpperCase() + displayData.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Principal</label>
                  <p className="text-base text-gray-900">{displayData.principal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base text-gray-900">
                    <a href={`mailto:${displayData.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                      {displayData.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-base text-gray-900">{displayData.address || 'Not provided'}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                {isApplication ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base text-gray-900">
                        <a href={`tel:${displayData.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {displayData.phone || 'Not provided'}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Number of Students</label>
                      <p className="text-base text-gray-900">{displayData.numberOfStudents || 0}</p>
                    </div>
                    {displayData.reviewNotes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Review Notes</label>
                        <p className="text-base text-gray-900">{displayData.reviewNotes}</p>
                      </div>
                    )}
                    {displayData.reviewedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reviewed Date</label>
                        <p className="text-base text-gray-900">
                          {new Date(displayData.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Login</label>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        displayData.isFirstLogin ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {displayData.isFirstLogin ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-base text-gray-900">
                        {displayData.createdAt ? new Date(displayData.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-base text-gray-900">
                        {displayData.updatedAt ? new Date(displayData.updatedAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Points Information (if available) */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Points Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-2xl font-bold text-blue-600">{displayData.totalPoints || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Points</p>
                    <p className="text-2xl font-bold text-green-600">{displayData.availablePoints || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Used Points</p>
                    <p className="text-2xl font-bold text-orange-600">{displayData.usedPoints || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-blue-600">{displayData.students?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Students Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {displayData.students?.filter((student: Student) => student.paymentStatus === 'Paid').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Students Onboarded</p>
            <p className="text-2xl font-bold text-purple-600">
              {displayData.students?.filter((student: Student) => student.onboardingStatus === 'Onboarded').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="text-2xl font-bold text-orange-600">{displayData.totalPoints || 0}</p>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Year
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Onboarding Status
                    <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.length > 0 ? paginatedStudents.map((student, index) => (
                  <tr key={student._id || `student-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {student.name ? student.name.split(' ').map((n: string) => n[0]).join('') : 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.examYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.onboardingStatus === 'Onboarded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.onboardingStatus || 'Not Onboarded'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      {displayData.students?.length === 0 ? 'No students registered yet' : 'No students found matching your search'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Number Of Items displayed per page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <span className="text-sm text-gray-700">
                {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} Items
              </span>
            </div>

            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ‹
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
