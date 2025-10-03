'use client'

import React, { useState, useMemo } from 'react'
import { IoSearch, IoEye, IoTrash, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import { useCAModal } from '../contexts/CAModalContext'
import toast from 'react-hot-toast'

interface StudentRecord {
  schoolName: string
  serialNo: number
  name: string
  examNo: string
  sex: "Male" | "Female"
  age: number
  englishStudies: number
  mathematics: number
  basicScience: number
  christianReligiousStudies: number
  nationalValues: number
  culturalAndCreativeArts: number
  businessStudies: number
  history: number
  igbo: number
  hausa: number
  yoruba: number
  preVocationalStudies: number
  frenchLanguage: number
}

interface DataTableProps {
  data: StudentRecord[]
  onDataChange: (data: StudentRecord[]) => void
  className?: string
}

export default function DataTable({ data, onDataChange, className = "" }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentRecord | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { openModal } = useCAModal()

  const filteredData = useMemo(() => {
    return data.filter(record =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.examNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSort = (key: keyof StudentRecord) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map((_, index) => index)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedRows(newSelected)
  }

  const handleDeleteSelected = () => {
    const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a)
    const newData = [...data]
    
    indicesToDelete.forEach(index => {
      newData.splice(index, 1)
    })
    
    onDataChange(newData)
    setSelectedRows(new Set())
  }

  const handleViewCA = (student: StudentRecord) => {
    openModal(student)
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all CA data? This action cannot be undone.')) {
      onDataChange([])
      toast.success('All CA data cleared successfully')
    }
  }

  const handleSaveToDb = async () => {
    try {
      toast.loading('Saving CA data to database...')
      
      // TODO: Implement API call to save data to database
      // Example API call:
      // const response = await fetch('/api/ca-data', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ records: data })
      // })
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss()
      toast.success(`Successfully saved ${data.length} CA records to database`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to save CA data to database')
      console.error('Save to DB error:', error)
    }
  }

  return (
    <React.Fragment>
      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">CA Data</h3>
              <p className="text-sm text-gray-500">
                {data.length} total records, {filteredData.length} showing
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveToDb}
                title='Save to Database'
                className="inline-flex items-center cursor-pointer active:scale-90 active:rotate-1 transition-all duration-200 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <IoCloudUpload className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearData}
                title='Clear CA Data'
                className="inline-flex items-center cursor-pointer active:scale-90 active:rotate-1 transition-all duration-200 px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <IoRefresh className="w-4 h-4" />
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center cursor-pointer active:scale-90 active:rotate-1 transition-all duration-200 px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <IoTrash className="w-4 h-4 mr-2" />
                  Delete ({selectedRows.size})
                </button>
              )}
            </div>
          </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, exam no, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                { key: 'serialNo', label: 'S/NO' },
                { key: 'name', label: 'Name' },
                { key: 'examNo', label: 'Exam No.' },
                { key: 'sex', label: 'Sex' },
                { key: 'age', label: 'Age' },
                { key: 'schoolName', label: 'School' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as keyof StudentRecord)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {sortConfig.key === key && (
                      <span className="text-blue-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((record, index) => (
              <tr key={`${record.examNo}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={(e) => handleSelectRow(index, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.serialNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.examNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.sex === 'Male' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {record.sex}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-32 truncate" title={record.schoolName}>
                    {record.schoolName}
                  </div>
                </td>
                <td className=" py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handleViewCA(record)}
                    className="px-6 flex items-center justify-center cursor-pointer w-full"
                    title="View CA Details"
                  >
                    <div 
                      className="text-blue-600 text-center hover:text-blue-800 p-1 active:scale-90 active:rotate-1 transition-all duration-200 rounded hover:bg-blue-50 border border-transparent hover:border-blue-100"
                    >
                      <IoEye className="text-xl" />
                    </div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No records found</p>
        </div>
      )}

      </div>
    </React.Fragment>
  )
}
