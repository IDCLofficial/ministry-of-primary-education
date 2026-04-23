'use client'

import React, { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoSearch, IoEye, IoTrash, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import { useExamModal } from '../contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { StudentRecord, validateStudentRecord, ValidationError, ValidationErrorType } from '../utils/csvParser'
import { useRouter } from 'next/navigation'
import { BeceResultUpload, useUploadBeceExamResultsMutation } from '../../../../store/api/authApi'
import ErrorTypeModal from './ErrorTypeModal'

interface DataTableProps {
    data: StudentRecord[]
    onDataChange: (data: StudentRecord[]) => void
    onOpenOverrideModal: () => void
    className?: string
}

type SearchMode = 'contains' | 'startsWith' | 'exact'
type SearchField = 'all' | 'name' | 'examNo' | 'school'

function parseSearchQuery(raw: string): { mode: SearchMode; field: SearchField; term: string } {
    const q = (raw ?? '').trim()
    const lower = q.toLowerCase()

    const take = (prefix: string) => q.slice(prefix.length).trim()

    if (lower.startsWith('st:')) return { mode: 'startsWith', field: 'all', term: take('st:') }
    if (lower.startsWith('ex:')) return { mode: 'exact', field: 'all', term: take('ex:') }
    if (lower.startsWith('nm:')) return { mode: 'contains', field: 'name', term: take('nm:') }
    if (lower.startsWith('exm:')) return { mode: 'contains', field: 'examNo', term: take('exm:') }
    if (lower.startsWith('sch:')) return { mode: 'contains', field: 'school', term: take('sch:') }

    return { mode: 'contains', field: 'all', term: q }
}

function exportRecycleBinCsv(records: StudentRecord[]) {
    if (records.length === 0) return
    const headers = [
        'Serial No', 'Name', 'Exam No', 'School Name', 'LGA',
        'English Studies', 'Mathematics', 'Basic Science',
        'Christian Religious Studies', 'National Values',
        'Cultural and Creative Arts', 'Business Studies',
        'Igbo Language', 'Pre-Vocational Studies',
        'Exam Year', 'File Name'
    ]

    const rows = records.map(r => [
        r.serialNo,
        r.name,
        r.examNo,
        r.schoolName,
        r.lga ?? '',
        r.englishStudies ?? '',
        r.mathematics ?? '',
        r.basicScience ?? '',
        r.christianReligiousStudies ?? '',
        r.nationalValues ?? '',
        r.culturalAndCreativeArts ?? '',
        r.businessStudies ?? '',
        r.igbo ?? '',
        r.preVocationalStudies ?? '',
        r.examYear ?? '',
        r.file.name
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`))

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bece-recycle-bin-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export default function DataTable({ data, onDataChange, onOpenOverrideModal, className = "" }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const lastSelectedIndexRef = useRef<number | null>(null)
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<{ name: string; examNo: string; schoolName: string } | null>(null)
    const [sortConfig, setSortConfig] = useState<{
        key: keyof StudentRecord | null
        direction: 'asc' | 'desc'
    }>({ key: null, direction: 'asc' })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [isSaving, setIsSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')
    const [failedSchools, setFailedSchools] = useState<string[]>([])
    const [showFilesModal, setShowFilesModal] = useState(false)
    const [uploadingCount, setUploadingCount] = useState<number | null>(null)
    const uploadingCountRef = useRef<number | null>(null)
    const [mounted, setMounted] = useState(false)
    const [recycleBin, setRecycleBin] = useState<StudentRecord[]>([])
    const [recycleBinExported, setRecycleBinExported] = useState(true)
    const { openModal } = useExamModal()
    React.useEffect(() => setMounted(true), [])
    const router = useRouter()
    const [uploadBeceExamResults] = useUploadBeceExamResultsMutation()

    React.useEffect(() => {
        if (recycleBin.length > 0) setRecycleBinExported(false)
        if (recycleBin.length === 0) setRecycleBinExported(true)
    }, [recycleBin])

    const dataWithValidation = useMemo(() => {
        return data.map(record => ({
            ...record,
            validationErrors: validateStudentRecord(record)
        }))
    }, [data])

    const [excludedErrorKeys, setExcludedErrorKeys] = useState<Set<string>>(new Set())
    const [ignoredErrorKeys, setIgnoredErrorKeys] = useState<Set<string>>(new Set())

    const cleanRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = `${r.examNo}\0${r.file.name}`
            if (excludedErrorKeys.has(key)) return false
            const hasErrors = r.validationErrors && r.validationErrors.length > 0
            if (hasErrors && !ignoredErrorKeys.has(key)) return false
            return true
        })
    }, [dataWithValidation, excludedErrorKeys, ignoredErrorKeys])

    const errorRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = `${r.examNo}\0${r.file.name}`
            return r.validationErrors && r.validationErrors.length > 0 && !ignoredErrorKeys.has(key)
        })
    }, [dataWithValidation, ignoredErrorKeys])

    const ignoredRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = `${r.examNo}\0${r.file.name}`
            return ignoredErrorKeys.has(key)
        })
    }, [dataWithValidation, ignoredErrorKeys])

    const getErrorStyles = (errors: ValidationError[]): { bgClass: string; borderClass: string; label: string } | null => {
        if (!errors || errors.length === 0) return null
        if (errors.some(e => e.type === 'name_special_chars')) {
            return { bgClass: 'bg-yellow-50', borderClass: 'border-yellow-400', label: 'Name Error' }
        }
        if (errors.some(e => e.type === 'exam_number_invalid')) {
            return { bgClass: 'bg-red-50', borderClass: 'border-red-400', label: 'Exam # Error' }
        }
        if (errors.some(e => e.type === 'missing_required')) {
            return { bgClass: 'bg-orange-50', borderClass: 'border-orange-400', label: 'Missing Field' }
        }
        if (errors.some(e => e.type === 'incomplete_scores')) {
            return { bgClass: 'bg-blue-50', borderClass: 'border-blue-400', label: 'Incomplete Scores' }
        }
        return null
    }

    const recordKey = (r: StudentRecord) => `${r.examNo}\0${r.file.name}`

    const errorCounts = useMemo(() => {
        const counts: Record<string, number> = { name_special_chars: 0, exam_number_invalid: 0, missing_required: 0, incomplete_scores: 0 }
        const binKeys = new Set(recycleBin.map(recordKey))
        dataWithValidation.forEach(r => {
            const key = recordKey(r)
            if (binKeys.has(key)) return
            r.validationErrors?.forEach(e => {
                if (counts[e.type] !== undefined) counts[e.type]++
            })
        })
        return counts
    }, [dataWithValidation, recycleBin])

    const handleExcludeError = (key: string) => {
        setExcludedErrorKeys(prev => new Set(prev).add(key))
    }

    const handleIgnoreError = (key: string) => {
        setIgnoredErrorKeys(prev => new Set(prev).add(key))
        toast.success('Record ignored - can be uploaded')
    }

    const [activeErrorModal, setActiveErrorModal] = useState<string | null>(null)

    const errorTypeRecords = useMemo(() => {
        const types: Record<string, StudentRecord[]> = {
            name_special_chars: [],
            exam_number_invalid: [],
            missing_required: [],
            incomplete_scores: []
        }
        const binKeys = new Set(recycleBin.map(recordKey))
        dataWithValidation.forEach(r => {
            const key = recordKey(r)
            if (binKeys.has(key)) return
            r.validationErrors?.forEach(e => {
                if (types[e.type]) types[e.type].push(r)
            })
        })
        return types
    }, [dataWithValidation, recycleBin])

    const handleUnignoreError = (key: string) => {
        setIgnoredErrorKeys(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
        })
        toast.success('Record restored to error group')
    }

    const handleMoveErrorToBin = (key: string) => {
        const record = dataWithValidation.find(r => recordKey(r) === key)
        if (!record) return
        if (recycleBin.some(r => recordKey(r) === key)) {
            toast('Already in recycle bin', { icon: '🗑️' })
            return
        }
        setRecycleBin(prev => [...prev, record])
        onDataChange(data.filter(r => recordKey(r) !== key))
        setExcludedErrorKeys(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
        })
        setIgnoredErrorKeys(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
        })
        toast.success('Moved to recycle bin')
    }

    const handleBulkExcludeErrors = () => {
        const newExcluded = new Set(excludedErrorKeys)
        errorRecords.forEach(r => newExcluded.add(recordKey(r)))
        setExcludedErrorKeys(newExcluded)
        toast.success(`Excluded ${errorRecords.length} error records`)
    }

    const handleBulkMoveErrorsToBin = () => {
        const newBinRecords = errorRecords.filter(r => {
            const key = recordKey(r)
            return !recycleBin.some(rr => recordKey(rr) === key)
        })
        setRecycleBin(prev => [...prev, ...newBinRecords])
        const keysToRemove = new Set(errorRecords.map(recordKey))
        onDataChange(data.filter(r => !keysToRemove.has(recordKey(r))))
        setExcludedErrorKeys(new Set())
        setIgnoredErrorKeys(prev => {
            const next = new Set(prev)
            keysToRemove.forEach(k => next.delete(k))
            return next
        })
        toast.success(`Moved ${newBinRecords.length} error records to recycle bin`)
    }

    const handleCleanAndRestore = (key: string, updatedRecord?: any) => {
        const record = dataWithValidation.find(r => recordKey(r) === key)
        if (!record) return
        const updated = updatedRecord || {
            ...record,
            name: record.name.replace(/[^a-zA-Z\s\-'."\u2018\u2019\u02BC]/g, '').trim(),
            examNo: record.examNo.replace(/[^a-zA-Z0-9\/\\\-]/g, '').trim(),
        }
        const errors = validateStudentRecord(updated)
        if (errors.length === 0) {
            onDataChange(data.map(r => recordKey(r) === key ? updated : r))
            setExcludedErrorKeys(prev => {
                const next = new Set(prev)
                next.delete(key)
                return next
            })
            toast.success('Record fixed and restored')
        } else {
            toast.error('Record still has errors after auto-clean')
        }
    }

    const filteredData = useMemo(() => {
        const { mode, field, term } = parseSearchQuery(searchTerm)
        const t = term.toLowerCase()
        if (!t) return data

        const match = (value: string) => {
            const v = (value ?? '').toLowerCase()
            if (mode === 'startsWith') return v.startsWith(t)
            if (mode === 'exact') return v === t
            return v.includes(t)
        }

        return data.filter(record => {
            const name = record.name ?? ''
            const examNo = record.examNo ?? ''
            const school = record.schoolName ?? ''

            if (field === 'name') return match(name)
            if (field === 'examNo') return match(examNo)
            if (field === 'school') return match(school)

            return match(name) || match(examNo) || match(school)
        })
    }, [data, searchTerm])

    const searchFilteredRecords = useMemo(() => {
        const { mode, field, term } = parseSearchQuery(searchTerm)
        const t = term.toLowerCase()
        if (!t) return cleanRecords

        const match = (value: string) => {
            const v = (value ?? '').toLowerCase()
            if (mode === 'startsWith') return v.startsWith(t)
            if (mode === 'exact') return v === t
            return v.includes(t)
        }

        return cleanRecords.filter(record => {
            const name = record.name ?? ''
            const examNo = record.examNo ?? ''
            const school = record.schoolName ?? ''

            if (field === 'name') return match(name)
            if (field === 'examNo') return match(examNo)
            if (field === 'school') return match(school)

            return match(name) || match(examNo) || match(school)
        })
    }, [cleanRecords, searchTerm])

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return searchFilteredRecords

        return [...searchFilteredRecords].sort((a, b) => {
            const aValue = a[sortConfig.key!]
            const bValue = b[sortConfig.key!]

            // Handle undefined/null values - push them to the end
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [searchFilteredRecords, sortConfig])

    // Files/sheets in data (for "remove whole file" and batch context)
    const filesList = useMemo(() => {
        const map = new Map<string, number>()
        data.forEach(record => {
            const name = record.file.name
            map.set(name, (map.get(name) ?? 0) + 1)
        })
        return Array.from(map.entries()).map(([fileName, count]) => ({ fileName, count }))
    }, [data])

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = sortedData.slice(startIndex, endIndex)

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Optimistic progress simulation based on count being uploaded
    React.useEffect(() => {
        if (!isSaving) {
            setUploadProgress(0)
            setProgressMessage('')
            setUploadingCount(null)
            return
        }

        const count = uploadingCountRef.current ?? uploadingCount ?? data.length
        // Calculate estimated time: ~3.4ms per record (1600 records in 5.44s)
        const estimatedTimeMs = count * 3.4
        const updateInterval = 100 // Update every 100ms
        const totalSteps = Math.ceil(estimatedTimeMs / updateInterval)
        let currentStep = 0

        const progressMessages = [
            'Validating student records...',
            'Grouping students by school...',
            'Transforming subject scores...',
            'Preparing data for upload...',
            'Uploading to server...',
            'Processing exam records...',
            'Finalizing upload...'
        ]

        const interval = setInterval(() => {
            currentStep++
            
            // Optimistic progress: reaches ~95% by estimated time, then slows down
            let progress
            if (currentStep < totalSteps) {
                // Smooth curve to 95%
                progress = Math.min(95, (currentStep / totalSteps) * 95)
            } else {
                // Slow crawl from 95% to 99%
                const extraSteps = currentStep - totalSteps;
                progress = Math.min(99, 95 + (extraSteps * 0.5))
            }

            setUploadProgress(Math.floor(progress))

            // Update message based on progress
            const messageIndex = Math.min(
                Math.floor((progress / 100) * progressMessages.length),
                progressMessages.length - 1
            )
            setProgressMessage(progressMessages[messageIndex])

        }, updateInterval)

        return () => clearInterval(interval)
    }, [isSaving, data.length, uploadingCount])

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

    const handleSelectRow = (index: number, checked: boolean, shiftKey?: boolean) => {
        const newSelected = new Set(selectedRows)
        const anchor = lastSelectedIndexRef.current

        if (shiftKey && anchor !== null) {
            const start = Math.min(anchor, index)
            const end = Math.max(anchor, index)
            for (let i = start; i <= end; i++) {
                if (checked) newSelected.add(i)
                else newSelected.delete(i)
            }
        } else {
            if (checked) newSelected.add(index)
            else newSelected.delete(index)
        }

        lastSelectedIndexRef.current = index
        setSelectedRows(newSelected)
    }

    const applyBulkSelection = (action: 'none' | 'page' | 'filtered' | 'invert') => {
        if (action === 'none') {
            setSelectedRows(new Set())
            return
        }
        if (action === 'filtered') {
            setSelectedRows(new Set(sortedData.map((_, index) => index)))
            return
        }
        if (action === 'page') {
            const indices = new Set<number>()
            for (let i = startIndex; i < Math.min(endIndex, sortedData.length); i++) indices.add(i)
            setSelectedRows(indices)
            return
        }
        const inverted = new Set<number>()
        for (let i = 0; i < sortedData.length; i++) {
            if (!selectedRows.has(i)) inverted.add(i)
        }
        setSelectedRows(inverted)
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

    const handleViewExam = (student: StudentRecord) => {
        openModal(student)
    }

    const rowKey = (r: StudentRecord) => `${r.examNo}\0${r.file.name}`

    const startEditing = (record: StudentRecord) => {
        setEditingKey(rowKey(record))
        setEditDraft({
            name: record.name ?? '',
            examNo: record.examNo ?? '',
            schoolName: record.schoolName ?? '',
        })
    }

    const cancelEditing = () => {
        setEditingKey(null)
        setEditDraft(null)
    }

    const saveEditing = (record: StudentRecord) => {
        if (!editDraft) return
        const key = rowKey(record)
        const next = data.map(r => {
            if (rowKey(r) !== key) return r
            return {
                ...r,
                name: editDraft.name,
                examNo: editDraft.examNo,
                schoolName: editDraft.schoolName,
            }
        })
        onDataChange(next)
        cancelEditing()
        toast.success('Row updated')
    }

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all Exam data? This action cannot be undone.')) {
            onDataChange([])
            toast.success('All Exam data cleared successfully')
        }
    }

    const handleRemoveFile = (fileName: string) => {
        const count = data.filter(r => r.file.name === fileName).length
        if (!window.confirm(`Remove the entire sheet/file "${fileName}"? This will remove ${count} record${count !== 1 ? 's' : ''} from the table.`)) return
        onDataChange(data.filter(r => r.file.name !== fileName))
        setSelectedRows(new Set())
        toast.success(`Removed ${count} record${count !== 1 ? 's' : ''} (${fileName})`)
    }

    const handleSaveToDb = async () => {
        // Safety: if recycle bin has records and hasn't been exported since it changed, export now.
        if (recycleBin.length > 0 && !recycleBinExported) {
            exportRecycleBinCsv(recycleBin)
            setRecycleBinExported(true)
        }

        const recordsToUpload: StudentRecord[] =
            selectedRows.size > 0
                ? Array.from(selectedRows)
                    .sort((a, b) => a - b)
                    .map(i => sortedData[i])
                : data

        if (recordsToUpload.length === 0) {
            toast.error('No records to upload. Select rows or add data.')
            return
        }

        const isPartialUpload = recordsToUpload.length < data.length
        const remainingCount = data.length - recordsToUpload.length

        if (isPartialUpload && !window.confirm(
            `Upload ${recordsToUpload.length.toLocaleString()} selected record${recordsToUpload.length !== 1 ? 's' : ''}?\n\n${remainingCount.toLocaleString()} record${remainingCount !== 1 ? 's' : ''} will remain in the table for a later upload.`
        )) return

        const startTime = performance.now()
        const countToUpload = recordsToUpload.length
        uploadingCountRef.current = countToUpload
        setUploadingCount(countToUpload)
        setIsSaving(true)

        try {
            toast.loading(isPartialUpload ? `Saving ${recordsToUpload.length} selected records...` : 'Saving Exams data to database...')

            const schoolGroups = recordsToUpload.reduce((groups, student) => {
                const schoolName = student.schoolName
                if (!groups[schoolName]) groups[schoolName] = []
                groups[schoolName].push(student)
                return groups
            }, {} as Record<string, StudentRecord[]>)

            const filesWithStudentsCount: { fileName: string, fileSize: number, students: number }[] = recordsToUpload.reduce((files, student) => {
                const filename = student.file.name
                const existing = files.find(f => f.fileName === filename)
                if (existing) existing.students++
                else files.push({ fileName: filename, fileSize: student.file.size, students: 1 })
                return files
            }, [] as { fileName: string, fileSize: number, students: number }[])

            const results = Object.entries(schoolGroups).map(([schoolName, students]) => ({
                schoolName,
                lga: students[0]?.lga,
                examYear: students[0]?.examYear || new Date().getFullYear(),
                students: students.map(student => ({
                    name: student.name,
                    examNo: student.examNo,
                    subjects: [
                        { name: 'English Studies', exam: student.englishStudies },
                        { name: 'Mathematics', exam: student.mathematics },
                        { name: 'Basic Science', exam: student.basicScience },
                        { name: 'Christian Religious Studies', exam: student.christianReligiousStudies },
                        { name: 'National Values', exam: student.nationalValues },
                        { name: 'Cultural and Creative Arts', exam: student.culturalAndCreativeArts },
                        { name: 'Business Studies', exam: student.businessStudies },
                        { name: 'Igbo Language', exam: student.igbo },
                        { name: 'Pre-Vocational Studies', exam: student.preVocationalStudies }
                    ].filter(subject => subject.exam > 0)
                }))
            }))

            await uploadBeceExamResults({ result: results as BeceResultUpload[], file: filesWithStudentsCount }).unwrap()

            const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2)
            toast.dismiss()
            setUploadProgress(100)
            setProgressMessage('Upload complete!')
            await new Promise(r => setTimeout(r, 300))

            const uploadedKeys = new Set(recordsToUpload.map(r => `${r.examNo}\0${r.file.name}`))
            const newData = data.filter(r => !uploadedKeys.has(`${r.examNo}\0${r.file.name}`))
            onDataChange(newData)
            setSelectedRows(new Set())
            setFailedSchools([])

            if (newData.length > 0) {
                toast.success(
                    `Uploaded ${recordsToUpload.length.toLocaleString()} records in ${elapsedTime}s. ${newData.length.toLocaleString()} record${newData.length !== 1 ? 's' : ''} remaining.`
                )
            } else {
                toast.success(`Successfully saved ${recordsToUpload.length.toLocaleString()} score records to database in ${elapsedTime}s`)
                router.push('/exam-portal/dashboard/schools')
            }
        } catch (error) {
            console.error('Error saving score data:', error)
            toast.dismiss()
            toast.error('Failed to save score data to database. Please check your connection and try again.')
        } finally {
            setIsSaving(false)
            setUploadingCount(null)
            uploadingCountRef.current = null
        }
    }

    return (
        <React.Fragment>
            <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                BECE Exam Data {data.length > 0 && `(Exam Year: ${data[0].examYear})`}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length} total records, {sortedData.length} showing
                                {(errorCounts.name_special_chars + errorCounts.exam_number_invalid + errorCounts.missing_required + errorCounts.incomplete_scores) > 0 && (
                                    <span className="ml-2 inline-flex gap-2">
                                        <button onClick={() => setActiveErrorModal('name_special_chars')} className={`px-2 py-0.5 rounded text-xs font-medium ${errorCounts.name_special_chars > 0 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                                            {errorCounts.name_special_chars > 0 ? `⚠️ Name: ${errorCounts.name_special_chars}` : 'Name: 0'}
                                        </button>
                                        <button onClick={() => setActiveErrorModal('exam_number_invalid')} className={`px-2 py-0.5 rounded text-xs font-medium ${errorCounts.exam_number_invalid > 0 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-400'}`}>
                                            {errorCounts.exam_number_invalid > 0 ? `⚠️ Exam #: ${errorCounts.exam_number_invalid}` : 'Exam #: 0'}
                                        </button>
                                        <button onClick={() => setActiveErrorModal('missing_required')} className={`px-2 py-0.5 rounded text-xs font-medium ${errorCounts.missing_required > 0 ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-400'}`}>
                                            {errorCounts.missing_required > 0 ? `⚠️ Missing: ${errorCounts.missing_required}` : 'Missing: 0'}
                                        </button>
                                        <button onClick={() => setActiveErrorModal('incomplete_scores')} className={`px-2 py-0.5 rounded text-xs font-medium ${errorCounts.incomplete_scores > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                                            {errorCounts.incomplete_scores > 0 ? `⚠️ Scores: ${errorCounts.incomplete_scores}` : 'Scores: 0'}
                                        </button>
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSaveToDb}
                                disabled={isSaving}
                                title={selectedRows.size > 0 ? `Upload ${selectedRows.size} selected` : 'Upload all to database'}
                                className={`inline-flex items-center gap-2 transition-all duration-200 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : selectedRows.size > 0 ? (
                                    <>
                                        <IoCloudUpload className="w-4 h-4 flex-shrink-0" />
                                        <span>Upload selected ({selectedRows.size})</span>
                                    </>
                                ) : (
                                    <>
                                        <IoCloudUpload className="w-4 h-4 flex-shrink-0" />
                                        <span>Upload all</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleClearData}
                                disabled={isSaving}
                                title='Clear Exams Data'
                                className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                <IoRefresh className="w-4 h-4" />
                            </button>
                            {selectedRows.size > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={isSaving}
                                    className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                        }`}
                                >
                                    <IoTrash className="w-4 h-4 mr-2" />
                                    Delete ({selectedRows.size})
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Selection banner: make batch upload obvious */}
                    {selectedRows.size > 0 && (
                        <div className="mt-3 px-4 py-2 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                <span className="font-semibold">{selectedRows.size} rows selected</span>
                                {' — green button will upload only these. Clear selection to upload all.'}
                            </p>
                        </div>
                    )}
                    {/* Search and Filters */}
                    <div className="mt-4 flex items-center justify-between space-x-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search... (st: starts-with, ex: exact, nm:/exm:/sch:)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isSaving}
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none text-sm ${isSaving
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 bg-white focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500'
                                        }`}
                                />
                            </div>
                        </div>
                        <button
                            onClick={onOpenOverrideModal}
                            disabled={isSaving || data.length === 0}
                            className={`inline-flex items-center cursor-pointer px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isSaving || data.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 cursor-pointer'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Override by File
                        </button>
                    </div>
                    {/* Sheets / files: remove whole file — inside header so it’s always visible */}
                    {filesList.length > 0 && (
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => setShowFilesModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-gray-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                            >
                                📁 Sheets / files in this upload ({filesList.length} file{filesList.length !== 1 ? 's' : ''})
                            </button>
                        </div>
                    )}
                </div>

                {errorRecords.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                    ⚠️ Records with Errors ({errorRecords.length})
                                </span>
                                <span className="text-xs text-gray-500">(Excluded from upload)</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleBulkExcludeErrors} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100">
                                    Exclude Page
                                </button>
                                <button onClick={handleBulkMoveErrorsToBin} className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded hover:bg-orange-50">
                                    Move to Bin
                                </button>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {errorRecords.slice(0, 20).map((record) => {
                                const key = recordKey(record)
                                const errors = record.validationErrors || []
                                const errorStyle = getErrorStyles(errors)
                                return (
                                    <div key={key} className={`flex items-center justify-between p-2 rounded border ${errorStyle?.bgClass} ${errorStyle?.borderClass} border`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate">{record.name}</span>
                                                <span className="text-xs text-gray-500">({record.examNo})</span>
                                            </div>
                                            <div className="flex gap-1 mt-0.5">
                                                {errors.slice(0, 2).map((e, i) => (
                                                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-white/80 border">{e.message}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button onClick={() => handleCleanAndRestore(key)} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Fix</button>
                                            <button onClick={() => handleExcludeError(key)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100">Exclude</button>
                                            <button onClick={() => handleIgnoreError(key)} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">Ignore</button>
                                            <button onClick={() => handleMoveErrorToBin(key)} className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded hover:bg-orange-50">Bin</button>
                                        </div>
                                    </div>
                                )
                            })}
                            {errorRecords.length > 20 && <p className="text-xs text-gray-500 text-center py-1">... and {errorRecords.length - 20} more</p>}
                        </div>
                    </div>
                )}

                {ignoredRecords.length > 0 && (
                    <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700">Ignored ({ignoredRecords.length}) — included in upload</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {ignoredRecords.slice(0, 10).map((record) => {
                                const key = recordKey(record)
                                return (
                                    <div key={key} className="flex items-center justify-between p-2 rounded border border-purple-200 bg-white">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm truncate">{record.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">({record.examNo})</span>
                                        </div>
                                        <button onClick={() => handleUnignoreError(key)} className="px-2 py-1 text-xs border border-purple-300 text-purple-700 rounded hover:bg-purple-100">Unignore</button>
                                    </div>
                                )
                            })}
                            {ignoredRecords.length > 10 && <p className="text-xs text-purple-500 text-center">... and {ignoredRecords.length - 10} more</p>}
                        </div>
                    </div>
                )}

                {failedSchools.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700 font-medium">⚠️ Upload Failed</p>
                        <p className="text-xs text-red-600">
                            The following schools failed to upload: {failedSchools.join(', ')}.
                            Please retry the upload for these records.
                        </p>
                    </div>
                )}
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            disabled={isSaving}
                                            className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                const v = e.target.value as '' | 'none' | 'page' | 'filtered' | 'invert'
                                                if (!v) return
                                                applyBulkSelection(v)
                                                e.currentTarget.value = ''
                                            }}
                                            disabled={isSaving || sortedData.length === 0}
                                            className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-700 disabled:opacity-50"
                                            title="Bulk selection"
                                        >
                                            <option value="">Select…</option>
                                            <option value="page">This page</option>
                                            <option value="filtered">All filtered</option>
                                            <option value="invert">Invert</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                </th>
                                {[
                                    { key: 'serialNo', label: 'S/NO' },
                                    { key: 'name', label: 'Name' },
                                    { key: 'examNo', label: 'Exam No.' },
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
                                                <span className="text-green-600">
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
                            {paginatedData.map((record, pageIndex) => {
                                const globalIndex = startIndex + pageIndex
                                const key = rowKey(record)
                                const isEditing = editingKey === key
                                const errors = record.validationErrors || []
                                const errorStyle = getErrorStyles(errors)
                                const hasError = !!errorStyle
                                return (
                                <tr key={`${record.examNo}-${globalIndex}`} className={`hover:bg-gray-50 ${hasError ? `${errorStyle.bgClass} border-l-4 ${errorStyle.borderClass}` : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(globalIndex)}
                                            onChange={(e) => handleSelectRow(globalIndex, e.target.checked, (e.nativeEvent as MouseEvent).shiftKey)}
                                            disabled={isSaving}
                                            className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.serialNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {isEditing ? (
                                            <input
                                                value={editDraft?.name ?? ''}
                                                onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { name: '', examNo: '', schoolName: '' }), name: e.target.value }))}
                                                disabled={isSaving}
                                                className="w-full max-w-[240px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            />
                                        ) : (
                                            record.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {isEditing ? (
                                            <input
                                                value={editDraft?.examNo ?? ''}
                                                onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { name: '', examNo: '', schoolName: '' }), examNo: e.target.value }))}
                                                disabled={isSaving}
                                                className="w-full max-w-[200px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            />
                                        ) : (
                                            record.examNo
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {isEditing ? (
                                            <input
                                                value={editDraft?.schoolName ?? ''}
                                                onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { name: '', examNo: '', schoolName: '' }), schoolName: e.target.value }))}
                                                disabled={isSaving}
                                                className="w-full max-w-[240px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            />
                                        ) : (
                                            <div className="max-w-32 truncate" title={record.schoolName}>
                                                {record.schoolName}
                                            </div>
                                        )}
                                    </td>
                                    <td className=" py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center justify-end gap-2 px-6">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => saveEditing(record)}
                                                        disabled={isSaving}
                                                        className="px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        disabled={isSaving}
                                                        className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleViewExam(record)}
                                                        disabled={isSaving}
                                                        className={`p-1.5 rounded border border-transparent transition-all duration-200 ${isSaving
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-green-600 hover:text-green-800 active:scale-90 active:rotate-1 hover:bg-green-50 hover:border-green-100 cursor-pointer'
                                                            }`}
                                                        title={isSaving ? 'Saving in progress...' : 'View / edit details'}
                                                    >
                                                        <IoEye className="text-xl" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(record)}
                                                        disabled={isSaving}
                                                        className={`px-2 py-1 text-xs font-medium rounded-md border border-gray-300 ${isSaving
                                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                            : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                                                            }`}
                                                        title="Edit row"
                                                    >
                                                        Edit
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
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
                                        className={`px-3 py-1 text-sm border rounded active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer ${currentPage === pageNum
                                            ? 'bg-green-600 text-white border-green-600'
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

                {/* Loading Overlay with Progress Bar */}
            </div>

            {/* Modals portaled outside the table so they aren't clipped and show correct count */}
            {mounted && createPortal(
                <>
                    {isSaving && (
                        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4">
                                <div className="flex items-center justify-center mb-4">
                                    <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-semibold text-gray-900 mb-2">Saving to Database</p>
                                <p className="text-sm text-gray-600 mb-4">
                                        Processing {(selectedRows.size > 0 ? selectedRows.size : data.length).toLocaleString()} BECE exam records...
                                </p>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-700">{progressMessage}</span>
                                            <span className="text-sm font-semibold text-green-600">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <p className="text-xs text-blue-800 flex items-center justify-center">
                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Please don&apos;t close this window
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showFilesModal && filesList.length > 0 && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                            onClick={() => setShowFilesModal(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="files-modal-title"
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                    <h3 id="files-modal-title" className="text-lg font-semibold text-gray-900">
                                        Sheets / files in this upload ({filesList.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilesModal(false)}
                                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        aria-label="Close"
                                    >
                                        <span className="text-xl leading-none">&times;</span>
                                    </button>
                                </div>
                                <p className="px-4 pt-2 text-xs text-gray-500">
                                    Remove an entire sheet/file from the table with the trash icon. Use checkboxes to upload only selected rows.
                                </p>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {filesList.map(({ fileName, count }) => (
                                            <span
                                                key={fileName}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm"
                                            >
                                                <span className="max-w-[240px] truncate text-gray-800" title={fileName}>{fileName}</span>
                                                <span className="text-amber-700 text-xs font-medium">({count})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleRemoveFile(fileName)
                                                        if (filesList.length <= 1) setShowFilesModal(false)
                                                    }}
                                                    disabled={isSaving}
                                                    className="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    title="Remove this entire sheet/file"
                                                >
                                                    <IoTrash className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}

            {activeErrorModal && (
                <ErrorTypeModal
                    isOpen={true}
                    onClose={() => setActiveErrorModal(null)}
                    title={activeErrorModal}
                    errorType={activeErrorModal}
                    records={errorTypeRecords[activeErrorModal] || []}
                    onCleanAndRestore={handleCleanAndRestore}
                    onIgnore={handleIgnoreError}
                    onUnignore={handleUnignoreError}
                    onMoveToBin={handleMoveErrorToBin}
                    onExclude={handleExcludeError}
                    onDataChange={onDataChange}
                    validateRecord={validateStudentRecord}
                />
            )}
        </React.Fragment>
    )
}
