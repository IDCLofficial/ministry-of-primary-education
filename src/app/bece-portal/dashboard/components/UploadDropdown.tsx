import Link from 'next/link'
import React from 'react'
import { IoCloudUpload } from 'react-icons/io5'

interface UploadDropdownProps {
  className?: string
}

export default function UploadDropdown({ className = "" }: UploadDropdownProps) {
  return (
    <Link
      href="/bece-portal/dashboard/upload"
      className={`cursor-pointer active:scale-90 active:rotate-1 inline-flex items-center px-5 py-2 border text-sm font-medium rounded-md text-green-600 hover:text-white border-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${className}`}
    >
      <IoCloudUpload className="w-4 h-4 mr-2" />
      Upload Results
    </Link>
  )
}