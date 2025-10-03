'use client'

import React, { useState, useCallback } from 'react'
import MultiFileUpload from './components/MultiFileUpload'
import DataTable from './components/DataTable'
import { parseCSVFile, StudentRecord } from './utils/csvParser'
import toast from 'react-hot-toast'

export default function UploadCA() {
    const [studentData, setStudentData] = useState<StudentRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleFilesUploaded = useCallback(async (files: File[]) => {
        setIsLoading(true)
        const allRecords: StudentRecord[] = []

        try {
            for (const file of files) {
                try {
                    const records = await parseCSVFile(file)
                    allRecords.push(...records)
                    toast.success(`Successfully parsed ${records.length} records from ${file.name}`)
                } catch (error) {
                    console.error(`Error parsing ${file.name}:`, error)
                    toast.error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            }

            if (allRecords.length > 0) {

                
                setStudentData(prev => {
                    // Create a Set of existing exam numbers for fast lookup
                    const existingExamNos = new Set(prev.map(record => record.examNo))
                    
                    // Filter out duplicates based on examNo
                    const newRecords = allRecords.filter(record => !existingExamNos.has(record.examNo))                    
                    return [...prev, ...newRecords]
                })
            }
        } catch (error) {
            console.error('Error processing files:', error)
            toast.error('Failed to process uploaded files')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleDataChange = useCallback((newData: StudentRecord[]) => {
        setStudentData(newData)
    }, [])

    const hasData = studentData.length > 0

    if (isLoading) {
        return (
            <div className='p-3 bg-white/50 backdrop-blur-[2px] h-full overflow-y-auto border border-black/10 flex items-center justify-center'>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing uploaded files...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={'p-3 bg-white/50 backdrop-blur-[2px] border border-black/10 m-1 mb-0 space-y-4 flex-1 overflow-auto' + (hasData ? ' overflow-y-auto' : 'overflow-hidden')}>
            {hasData ? (
                <DataTable 
                    data={studentData}
                    onDataChange={handleDataChange}
                    className="flex-1 overflow-hidden"
                />
            ) : (
                /* Full screen upload when no data */
                <MultiFileUpload 
                    onFilesUploaded={handleFilesUploaded}
                    hasData={hasData}
                    className="flex-1"
                />
            )}
        </div>
    )
}