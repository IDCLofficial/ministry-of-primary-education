'use client'

import { useState, useMemo } from 'react'

export interface Student {
  id: string
  name: string
  gender: string
  class: string
  examYear: string
  paymentStatus: 'Paid' | 'Pending'
  onboardingStatus: 'Onboarded' | 'Not Onboarded'
}

export interface School {
  id: number
  name: string
  uniqueCode: string
  studentsPaidFor: number
  studentsOnboarded: number
  dateApproved: string
  status: 'approved' | 'pending'
  students: Student[]
  principal: string
  email: string
  phone: string
  address: string
  applicationDate: string
}

interface SchoolsTableProps {
  activeTab: string
  onSchoolClick?: (school: School) => void
}

// Helper function to generate principal data
const generatePrincipalData = (schoolId: number) => {
  const principals = [
    'Dr. Chukwuma Okafor', 'Mrs. Ngozi Nwankwo', 'Mr. Emeka Eze', 'Dr. Adaeze Obi',
    'Prof. Kelechi Anyanwu', 'Mrs. Chioma Okwu', 'Mr. Ikechukwu Nwosu', 'Dr. Amara Onyeka',
    'Mrs. Nneka Nwachukwu', 'Mr. Obinna Okoro', 'Dr. Chinonso Agu', 'Mrs. Ifeoma Nnamdi',
    'Mr. Uzoma Okafor', 'Dr. Chiamaka Nweke', 'Mrs. Amarachi Okorie'
  ]
  
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const areas = ['Owerri', 'Okigwe', 'Orlu', 'Mbaise', 'Oguta', 'Ideato', 'Nkwerre']
  
  const principal = principals[(schoolId - 1) % principals.length]
  const email = `${principal.toLowerCase().replace(/[^a-z]/g, '')}@${domains[schoolId % domains.length]}`
  const phone = `+234${String(800000000 + schoolId * 1234567).slice(0, 10)}`
  const address = `${Math.floor(Math.random() * 99) + 1} School Road, ${areas[schoolId % areas.length]}, Imo State`
  
  return { principal, email, phone, address }
}

// Helper function to generate student data
const generateStudents = (count: number, paidCount: number, onboardedCount: number): Student[] => {
  const names = [
    'Chinedu Okorie', 'Adaeze Nwankwo', 'Emeka Okafor', 'Chioma Eze', 'Kelechi Obi',
    'Ngozi Anyanwu', 'Ikechukwu Okonkwo', 'Amara Nwosu', 'Chukwuma Onyeka', 'Nneka Okafor',
    'Obinna Nwachukwu', 'Chinonso Okwu', 'Adanna Okoye', 'Chidiebere Agu', 'Ifeoma Nnamdi',
    'Uzoma Okoro', 'Chiamaka Okafor', 'Chinedum Nweke', 'Amarachi Obi', 'Kenechukwu Eze'
  ]
  
  const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']
  const genders = ['Male', 'Female']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `203918${String(2734 + i).padStart(4, '0')}`,
    name: names[i % names.length],
    gender: genders[i % 2],
    class: classes[Math.floor(i / 50) % classes.length],
    examYear: '2025',
    paymentStatus: (i < paidCount) ? 'Paid' as const : 'Pending' as const,
    onboardingStatus: (i < onboardedCount) ? 'Onboarded' as const : 'Not Onboarded' as const
  }))
}

// Mock JSON data for demonstration
export const mockSchools: School[] = [
  {
    id: 1,
    name: 'Bright Future Academy',
    uniqueCode: 'SCH-3421',
    studentsPaidFor: 400,
    studentsOnboarded: 200,
    dateApproved: '24 Sept 2025',
    status: 'approved',
    students: generateStudents(450, 400, 200),
    ...generatePrincipalData(1),
    applicationDate: '15 Aug 2025'
  },
  {
    id: 2,
    name: 'Excellence Primary School',
    uniqueCode: 'SCH-2156',
    studentsPaidFor: 350,
    studentsOnboarded: 180,
    dateApproved: '22 Sept 2025',
    status: 'pending',
    students: generateStudents(400, 350, 180),
    ...generatePrincipalData(2),
    applicationDate: '10 Aug 2025'
  },
  {
    id: 3,
    name: 'St. Mary\'s Catholic School',
    uniqueCode: 'SCH-4789',
    studentsPaidFor: 520,
    studentsOnboarded: 310,
    dateApproved: '20 Sept 2025',
    status: 'approved',
    students: generateStudents(580, 520, 310),
    ...generatePrincipalData(3),
    applicationDate: '12 Aug 2025'
  },
  {
    id: 4,
    name: 'Government Primary School Owerri',
    uniqueCode: 'SCH-1234',
    studentsPaidFor: 600,
    studentsOnboarded: 450,
    dateApproved: '18 Sept 2025',
    status: 'approved',
    students: generateStudents(650, 600, 450),
    ...generatePrincipalData(4),
    applicationDate: '08 Aug 2025'
  },
  {
    id: 5,
    name: 'New Horizon Academy',
    uniqueCode: 'SCH-5678',
    studentsPaidFor: 280,
    studentsOnboarded: 150,
    dateApproved: 'Pending Review',
    status: 'pending',
    students: generateStudents(320, 280, 150),
    ...generatePrincipalData(5),
    applicationDate: '20 Aug 2025'
  },
  {
    id: 6,
    name: 'Royal Kids International',
    uniqueCode: 'SCH-9012',
    studentsPaidFor: 450,
    studentsOnboarded: 220,
    dateApproved: '12 Sept 2025',
    status: 'approved',
    students: generateStudents(500, 450, 220),
    ...generatePrincipalData(6),
    applicationDate: '05 Aug 2025'
  },
  {
    id: 7,
    name: 'Community Primary School Okigwe',
    uniqueCode: 'SCH-3456',
    studentsPaidFor: 380,
    studentsOnboarded: 200,
    dateApproved: 'Under Review',
    status: 'pending',
    students: generateStudents(420, 380, 200),
    ...generatePrincipalData(7),
    applicationDate: '18 Aug 2025'
  },
  {
    id: 8,
    name: 'Divine Mercy School',
    uniqueCode: 'SCH-7890',
    studentsPaidFor: 320,
    studentsOnboarded: 180,
    dateApproved: '08 Sept 2025',
    status: 'approved',
    students: generateStudents(360, 320, 180),
    ...generatePrincipalData(8),
    applicationDate: '25 Jul 2025'
  },
  {
    id: 9,
    name: 'Progressive Primary School',
    uniqueCode: 'SCH-2468',
    studentsPaidFor: 410,
    studentsOnboarded: 250,
    dateApproved: 'Awaiting Documents',
    status: 'pending',
    students: generateStudents(460, 410, 250),
    ...generatePrincipalData(9),
    applicationDate: '22 Aug 2025'
  },
  {
    id: 10,
    name: 'Holy Trinity Academy',
    uniqueCode: 'SCH-1357',
    studentsPaidFor: 360,
    studentsOnboarded: 190,
    dateApproved: '03 Sept 2025',
    status: 'approved',
    students: generateStudents(400, 360, 190),
    ...generatePrincipalData(10),
    applicationDate: '28 Jul 2025'
  },
  {
    id: 11,
    name: 'Wisdom Gate School',
    uniqueCode: 'SCH-8024',
    studentsPaidFor: 290,
    studentsOnboarded: 160,
    dateApproved: 'In Review',
    status: 'pending',
    students: generateStudents(330, 290, 160),
    ...generatePrincipalData(11),
    applicationDate: '30 Aug 2025'
  },
  {
    id: 12,
    name: 'Victory Primary School',
    uniqueCode: 'SCH-4680',
    studentsPaidFor: 470,
    studentsOnboarded: 280,
    dateApproved: '30 Aug 2025',
    status: 'approved',
    students: generateStudents(520, 470, 280),
    ...generatePrincipalData(12),
    applicationDate: '15 Jul 2025'
  },
  {
    id: 13,
    name: 'Grace Academy Orlu',
    uniqueCode: 'SCH-1593',
    studentsPaidFor: 340,
    studentsOnboarded: 170,
    dateApproved: 'Pending Verification',
    status: 'pending',
    students: generateStudents(380, 340, 170),
    ...generatePrincipalData(13),
    applicationDate: '02 Sept 2025'
  },
  {
    id: 14,
    name: 'Premier Primary School',
    uniqueCode: 'SCH-7531',
    studentsPaidFor: 390,
    studentsOnboarded: 210,
    dateApproved: '25 Aug 2025',
    status: 'approved',
    students: generateStudents(430, 390, 210),
    ...generatePrincipalData(14),
    applicationDate: '10 Jul 2025'
  },
  {
    id: 15,
    name: 'Unity Primary School Mbaise',
    uniqueCode: 'SCH-9642',
    studentsPaidFor: 420,
    studentsOnboarded: 240,
    dateApproved: '22 Aug 2025',
    status: 'approved',
    students: generateStudents(470, 420, 240),
    ...generatePrincipalData(15),
    applicationDate: '05 Jul 2025'
  }
]

export default function SchoolsTable({ activeTab, onSchoolClick }: SchoolsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter schools based on search term and active tab
  const filteredSchools = useMemo(() => {
    return mockSchools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTab = activeTab === 'approved' ? school.status === 'approved' : school.status === 'pending'
      
      return matchesSearch && matchesTab
    })
  }, [searchTerm, activeTab])

  // Paginate schools
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchools.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSchools, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schools</h2>
          <p className="text-sm text-gray-600 my-4">List Of Approved Schools on the System</p>
        </div>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Name
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique Code
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students Paid For
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students Onboarded
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Approved
                <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSchools.map((school) => (
              <tr 
                key={school.id} 
                className={`hover:bg-gray-50 ${school.status === 'approved' && onSchoolClick ? 'cursor-pointer' : ''}`}
                onClick={() => school.status === 'approved' && onSchoolClick && onSchoolClick(school)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {school.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.uniqueCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.studentsPaidFor.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.studentsOnboarded.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.dateApproved}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Number Of Items displayed per page</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredSchools.length)} of {filteredSchools.length} Items
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(page)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
