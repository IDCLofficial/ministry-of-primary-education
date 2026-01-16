'use client'

import React, { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { IoCloudUpload, IoDocument, IoClose, IoCheckmarkCircle } from 'react-icons/io5'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
}

interface MultiFileUploadProps {
  onFilesUploaded: (files: File[]) => void
  hasData: boolean
  className?: string
}

export default function MultiFileUpload({ onFilesUploaded, hasData, className = "" }: MultiFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: File[]) => {
    const csvFiles = files.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFiles.length === 0) {
      toast.error('Please upload only CSV files')
      return
    }

    const newFiles: UploadedFile[] = csvFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id) {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100)
            const newStatus = newProgress >= 100 ? 'completed' : 'uploading'
            
            if (newStatus === 'completed') {
              clearInterval(interval)
            }
            
            return { ...f, progress: newProgress, status: newStatus }
          }
          return f
        }))
      }, 200)
    })

    onFilesUploaded(csvFiles)
  }, [onFilesUploaded])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [handleFiles])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (hasData) {
    // Compact view when data is present
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Additional Files</h3>
          <button
            onClick={handleClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all active:scale-90 active:rotate-1 duration-200"
          >
            <IoCloudUpload className="w-4 h-4 mr-2" />
            Upload CSV
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <IoDocument className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.file.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'completed' && (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-all active:scale-90 active:rotate-1 duration-200"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Full view when no data is present
  return (
    <div className={`flex flex-col items-center justify-center h-full ${className}`}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload CA Files</h2>
          <p className="text-gray-600">Upload CSV files containing Continuous Assessment data</p>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <IoCloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Click to upload or drag and drop
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            CSV files only (max 800x400px)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Uploaded Files</h4>
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <IoDocument className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {uploadedFile.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(uploadedFile.progress)}%</span>
                    </div>
                  )}
                  {uploadedFile.status === 'completed' && (
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-2 text-gray-400 cursor-pointer active:scale-90 active:rotate-1 transition-all duration-200 hover:text-red-500"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
