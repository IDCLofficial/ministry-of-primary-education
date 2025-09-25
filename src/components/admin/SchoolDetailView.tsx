'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Student, School } from './SchoolsTable'

interface SchoolDetailViewProps {
  school: School
  onBack: () => void
}

export default function SchoolDetailView({ school, onBack }: SchoolDetailViewProps) {
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
    return school.students.map((student, index) => ({
      'S/N': index + 1,
      'Student Name': student.name,
      'Gender': student.gender,
      'Class': student.class,
      'Exam Year': student.examYear,
      'Payment Status': student.paymentStatus,
      'Onboarding Status': student.onboardingStatus
    }))
  }

  const handleExportExcel = () => {
    const studentData = prepareStudentData()
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
    link.setAttribute('download', `${school.name.replace(/\s+/g, '_')}_Students_${new Date().toISOString().split('T')[0]}.csv`)
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
      doc.text(school.name, 105, 20, { align: 'center' })
      
      doc.setFontSize(16)
      doc.text('Student List Report', 105, 30, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' })
      
      // School Info
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      let yPos = 55
      
      doc.text(`School Code: ${school.uniqueCode}`, 20, yPos)
      yPos += 7
      doc.text(`Principal: ${school.principal}`, 20, yPos)
      yPos += 7
      doc.text(`Total Students: ${school.students.length}`, 20, yPos)
      yPos += 7
      doc.text(`Students Paid: ${school.studentsPaidFor}`, 20, yPos)
      yPos += 7
      doc.text(`Students Onboarded: ${school.studentsOnboarded}`, 20, yPos)
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
      const fileName = `${school.name.replace(/\s+/g, '_')}_Students_${new Date().toISOString().split('T')[0]}.pdf`
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

  // Calculate totals from actual student data
  const totalPaidStudents = school.students.filter(s => s.paymentStatus === 'Paid').length
  const totalPaidAmount = totalPaidStudents * 500 // ₦500 per student
  const transactionRef = `TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(school.id).padStart(4, '0')}`

  // Filter students based on search
  const filteredStudents = useMemo(() => 
    school.students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.includes(searchTerm)
    ), [school.students, searchTerm]
  )

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
                Application Review
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Complete Onboarding
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-blue-600">₦{totalPaidAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">No. of Students Paid For</p>
            <p className="text-2xl font-bold text-blue-600">{totalPaidStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
            <p className="text-lg font-bold text-blue-600">{transactionRef}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Last Payment Date</p>
            <p className="text-lg font-bold text-blue-600">{school.dateApproved}</p>
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
                {paginatedStudents.map((student, index) => (
                  <tr key={`${student.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.examYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.paymentStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.onboardingStatus}
                    </td>
                  </tr>
                ))}
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
