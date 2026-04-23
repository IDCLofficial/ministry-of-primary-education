'use client'

import React, { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoSearch, IoEye, IoTrash, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import { useExamModal } from '../contexts/ExamModalContext'
import toast from 'react-hot-toast'
import { UBEATStudentRecord, validateStudentRecord, ValidationError, ValidationErrorType } from '../utils/csvParser'
import { useRouter } from 'next/navigation'
import { useUploadUBEATResultsMutation } from '../../../../store/api/authApi'
import ErrorTypeModal from './ErrorTypeModal'

interface DataTableProps {
    data: UBEATStudentRecord[]
    onDataChange: (data: UBEATStudentRecord[]) => void
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

function recordKey(r: UBEATStudentRecord) {
    return `${r.examNumber}\0${r.file.name}`
}

function exportRecycleBinCsv(records: UBEATStudentRecord[]) {
    if (records.length === 0) return
    const headers = [
        'Serial No', 'Candidate Name', 'Exam Number', 'Sex', 'Age',
        'School Name', 'LGA', 'Zone', 'Code No', 'Attendance',
        'Mathematics CA', 'Mathematics Exam',
        'English CA', 'English Exam',
        'General Knowledge CA', 'General Knowledge Exam',
        'Igbo CA', 'Igbo Exam',
        'Exam Year', 'File Name'
    ]

    const rows = records.map(r => [
        r.serialNumber,
        r.studentName,
        r.examNumber,
        r.sex,
        r.age,
        r.schoolName,
        r.lga,
        r.zone,
        r.codeNo,
        r.attendance,
        r.subjects?.mathematics?.ca ?? '',
        r.subjects?.mathematics?.exam ?? '',
        r.subjects?.english?.ca ?? '',
        r.subjects?.english?.exam ?? '',
        r.subjects?.generalKnowledge?.ca ?? '',
        r.subjects?.generalKnowledge?.exam ?? '',
        r.subjects?.igbo?.ca ?? '',
        r.subjects?.igbo?.exam ?? '',
        r.examYear ?? '',
        r.file.name
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`))

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ubeat-recycle-bin-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export default function DataTable({ data, onDataChange, onOpenOverrideModal, className = "" }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    // selectedKeys: Set of recordKey strings — stable across sort/filter/page changes
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    // Anchor is the recordKey of the last directly-clicked row (for shift-range)
    const lastSelectedKeyRef = useRef<string | null>(null)
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<{ studentName: string; examNumber: string; schoolName: string; lga: string } | null>(null)
    const [sortConfig, setSortConfig] = useState<{
        key: keyof UBEATStudentRecord | null
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
    const [recycleBin, setRecycleBin] = useState<UBEATStudentRecord[]>([])
    const [showRecycleBin, setShowRecycleBin] = useState(false)
    const [recycleBinExported, setRecycleBinExported] = useState(true)
    const { openModal } = useExamModal()
    const router = useRouter()
    const [uploadUBEATResults] = useUploadUBEATResultsMutation()
    React.useEffect(() => setMounted(true), [])

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
    const [activeErrorModal, setActiveErrorModal] = useState<string | null>(null)

    const errorTypeRecords = useMemo(() => {
        const types: Record<string, UBEATStudentRecord[]> = {
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

    const cleanRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = recordKey(r)
            if (excludedErrorKeys.has(key)) return false
            const hasErrors = r.validationErrors && r.validationErrors.length > 0
            if (hasErrors && !ignoredErrorKeys.has(key)) return false
            return true
        })
    }, [dataWithValidation, excludedErrorKeys, ignoredErrorKeys])

    const manuallyExcluded = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = recordKey(r)
            return excludedErrorKeys.has(key) && (!r.validationErrors || r.validationErrors.length === 0)
        })
    }, [dataWithValidation, excludedErrorKeys])

    const errorRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = recordKey(r)
            return r.validationErrors && r.validationErrors.length > 0 && !ignoredErrorKeys.has(key)
        })
    }, [dataWithValidation, ignoredErrorKeys])

    const ignoredRecords = useMemo(() => {
        return dataWithValidation.filter(r => {
            const key = recordKey(r)
            return ignoredErrorKeys.has(key)
        })
    }, [dataWithValidation, ignoredErrorKeys])

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
            const name = record.studentName ?? ''
            const examNo = record.examNumber ?? ''
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

    const handleExcludeError = (key: string) => {
        setExcludedErrorKeys(prev => new Set(prev).add(key))
    }

    const handleIgnoreError = (key: string) => {
        setIgnoredErrorKeys(prev => new Set(prev).add(key))
        toast.success('Record ignored - can be uploaded')
    }

    const handleUnignoreError = (key: string) => {
        setIgnoredErrorKeys(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
        })
        toast.success('Record restored to error group')
    }

    const handleRestoreError = (key: string) => {
        setExcludedErrorKeys(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
        })
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
        errorRecords.forEach(r => {
            newExcluded.add(recordKey(r))
        })
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
            studentName: record.studentName.replace(/[^a-zA-Z\s\-'."\u2018\u2019\u02BC]/g, '').trim(),
            examNumber: record.examNumber.replace(/[^A-Za-z0-9\/\\\-]/g, '').trim(),
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

    const filteredData = useMemo(() => {
        const { mode, field, term } = parseSearchQuery(searchTerm)
        const t = term.toLowerCase()
        if (!t) return dataWithValidation

        const match = (value: string) => {
            const v = (value ?? '').toLowerCase()
            if (mode === 'startsWith') return v.startsWith(t)
            if (mode === 'exact') return v === t
            return v.includes(t)
        }

        return dataWithValidation.filter(record => {
            const name = record.studentName ?? ''
            const examNo = record.examNumber ?? ''
            const school = record.schoolName ?? ''

            if (field === 'name') return match(name)
            if (field === 'examNo') return match(examNo)
            if (field === 'school') return match(school)
            return match(name) || match(examNo) || match(school)
        })
    }, [dataWithValidation, searchTerm])

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

    // Prune selectedKeys that no longer exist in sortedData (e.g. after data change)
    const sortedDataKeys = useMemo(() => new Set(sortedData.map(recordKey)), [sortedData])
    React.useEffect(() => {
        setSelectedKeys(prev => {
            const pruned = new Set<string>()
            prev.forEach(k => { if (sortedDataKeys.has(k)) pruned.add(k) })
            return pruned.size === prev.size ? prev : pruned
        })
    }, [sortedDataKeys])

    // Optimistic progress simulation based on count being uploaded
    React.useEffect(() => {
        if (!isSaving) {
            setUploadProgress(0)
            setProgressMessage('')
            setUploadingCount(null)
            return
        }

        const count = uploadingCountRef.current ?? uploadingCount ?? data.length
        const estimatedTimeMs = count * 3.4
        const updateInterval = 100
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
            let progress
            if (currentStep < totalSteps) {
                progress = Math.min(95, (currentStep / totalSteps) * 95)
            } else {
                const extraSteps = currentStep - totalSteps
                progress = Math.min(99, 95 + (extraSteps * 0.5))
            }
            setUploadProgress(Math.floor(progress))
            const messageIndex = Math.min(
                Math.floor((progress / 100) * progressMessages.length),
                progressMessages.length - 1
            )
            setProgressMessage(progressMessages[messageIndex])
        }, updateInterval)

        return () => clearInterval(interval)
    }, [isSaving, data.length, uploadingCount])

    const handleSort = (key: keyof UBEATStudentRecord) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedKeys(new Set(sortedData.map(recordKey)))
        } else {
            setSelectedKeys(new Set())
        }
    }

    /**
     * Handles row checkbox clicks with shift-range support.
     * Uses stable recordKeys and sortedData positions for range calculation,
     * so shift-select works correctly across pages, sorts, and filter changes.
     */
    const handleSelectRow = (key: string, checked: boolean, shiftKey?: boolean) => {
        const newSelected = new Set(selectedKeys)
        const anchorKey = lastSelectedKeyRef.current

        if (shiftKey && anchorKey !== null) {
            // Find positions of anchor and current row in sortedData
            const anchorPos = sortedData.findIndex(r => recordKey(r) === anchorKey)
            const currentPos = sortedData.findIndex(r => recordKey(r) === key)

            if (anchorPos !== -1 && currentPos !== -1) {
                const start = Math.min(anchorPos, currentPos)
                const end = Math.max(anchorPos, currentPos)
                for (let i = start; i <= end; i++) {
                    const k = recordKey(sortedData[i])
                    if (checked) newSelected.add(k)
                    else newSelected.delete(k)
                }
            } else {
                // Fallback: just toggle the clicked row
                if (checked) newSelected.add(key)
                else newSelected.delete(key)
            }
        } else {
            if (checked) newSelected.add(key)
            else newSelected.delete(key)
        }

        // Only update anchor on direct (non-shift) clicks so the anchor
        // stays stable across a shift-extended selection
        if (!shiftKey) lastSelectedKeyRef.current = key
        setSelectedKeys(newSelected)
    }

    const applyBulkSelection = (action: 'none' | 'page' | 'filtered' | 'invert') => {
        if (action === 'none') {
            setSelectedKeys(new Set())
            return
        }
        if (action === 'filtered') {
            setSelectedKeys(new Set(sortedData.map(recordKey)))
            return
        }
        if (action === 'page') {
            setSelectedKeys(new Set(paginatedData.map(recordKey)))
            return
        }
        // invert
        const inverted = new Set<string>()
        sortedData.forEach(r => {
            const k = recordKey(r)
            if (!selectedKeys.has(k)) inverted.add(k)
        })
        setSelectedKeys(inverted)
    }

    const handleDeleteSelected = () => {
        onDataChange(data.filter(r => !selectedKeys.has(recordKey(r))))
        setSelectedKeys(new Set())
    }

    const handleMoveToRecycleBin = (key: string) => {
        const record = sortedData.find(r => recordKey(r) === key)
        if (!record) return
        if (recycleBin.some(r => recordKey(r) === key)) {
            toast('Already in recycle bin', { icon: '🗑️' })
            return
        }
        setRecycleBin(prev => [...prev, record])
        onDataChange(data.filter(r => recordKey(r) !== key))
        setSelectedKeys(new Set())
        toast.success('Moved to recycle bin')
    }

    const handleMoveSelectedToRecycleBin = () => {
        if (selectedKeys.size === 0) return
        const records = sortedData.filter(r => selectedKeys.has(recordKey(r)))
        const existingKeys = new Set(recycleBin.map(recordKey))
        const newBinRecords = records.filter(r => !existingKeys.has(recordKey(r)))
        setRecycleBin(prev => [...prev, ...newBinRecords])
        onDataChange(data.filter(r => !selectedKeys.has(recordKey(r))))
        setSelectedKeys(new Set())
        toast.success(`Moved ${records.length} record${records.length !== 1 ? 's' : ''} to recycle bin`)
    }

    const handleRestoreFromBin = (key: string) => {
        const record = recycleBin.find(r => recordKey(r) === key)
        if (!record) return
        setRecycleBin(prev => prev.filter(r => recordKey(r) !== key))
        onDataChange([...data, record])
        toast.success('Record restored to table')
    }

    const handleRestoreAll = () => {
        onDataChange([...data, ...recycleBin])
        setRecycleBin([])
        toast.success(`Restored ${recycleBin.length} records`)
    }

    const handleEmptyRecycleBin = () => {
        if (!window.confirm(`Permanently delete all ${recycleBin.length} records in the recycle bin? This cannot be undone.`)) return
        setRecycleBin([])
        toast.success('Recycle bin emptied')
    }

    const handleViewExam = (student: UBEATStudentRecord) => {
        openModal(student)
    }

    const startEditing = (record: UBEATStudentRecord) => {
        const key = recordKey(record)
        setEditingKey(key)
        setEditDraft({
            studentName: record.studentName ?? '',
            examNumber: record.examNumber ?? '',
            schoolName: record.schoolName ?? '',
            lga: record.lga ?? '',
        })
    }

    const cancelEditing = () => {
        setEditingKey(null)
        setEditDraft(null)
    }

    const saveEditing = (record: UBEATStudentRecord) => {
        if (!editDraft) return
        const oldKey = recordKey(record)
        const nextRecord: UBEATStudentRecord = {
            ...record,
            studentName: editDraft.studentName,
            examNumber: editDraft.examNumber,
            schoolName: editDraft.schoolName,
            lga: editDraft.lga,
        }
        const newKey = recordKey(nextRecord)

        onDataChange(data.map(r => (recordKey(r) === oldKey ? nextRecord : r)))

        // If key changed (examNumber changed), keep selection consistent.
        if (oldKey !== newKey && selectedKeys.has(oldKey)) {
            setSelectedKeys(prev => {
                const next = new Set(prev)
                next.delete(oldKey)
                next.add(newKey)
                return next
            })
        }
        // If the anchor was this row, move it too.
        if (oldKey !== newKey && lastSelectedKeyRef.current === oldKey) {
            lastSelectedKeyRef.current = newKey
        }

        cancelEditing()
        toast.success('Row updated')
    }

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all UBEAT data? This action cannot be undone.')) {
            onDataChange([])
            toast.success('All UBEAT data cleared successfully')
        }
    }

    const handleRemoveFile = (fileName: string) => {
        const count = data.filter(r => r.file.name === fileName).length
        if (!window.confirm(`Remove the entire sheet/file "${fileName}"? This will remove ${count} record${count !== 1 ? 's' : ''} from the table.`)) return
        onDataChange(data.filter(r => r.file.name !== fileName))
        setSelectedKeys(new Set())
        toast.success(`Removed ${count} record${count !== 1 ? 's' : ''} (${fileName})`)
    }

    const handleSaveToDb = async () => {
        if (recycleBin.length > 0 && !recycleBinExported) {
            exportRecycleBinCsv(recycleBin)
            setRecycleBinExported(true)
        }

        const recordsToUpload: UBEATStudentRecord[] =
            selectedKeys.size > 0
                ? sortedData.filter(r => selectedKeys.has(recordKey(r)))
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
            toast.loading(isPartialUpload ? `Saving ${recordsToUpload.length} selected records...` : 'Saving UBEAT data to database...')

            const schoolGroups = recordsToUpload.reduce((groups, student) => {
                const schoolName = student.schoolName
                if (!groups[schoolName]) groups[schoolName] = []
                groups[schoolName].push(student)
                return groups
            }, {} as Record<string, UBEATStudentRecord[]>)

            const results = Object.entries(schoolGroups).map(([schoolName, students]) => ({
                lga: students[0]?.lga,
                examYear: students[0]?.examYear || new Date().getFullYear(),
                schoolName,
                students: students.map(student => ({
                    serialNumber: student.serialNumber,
                    examNumber: student.examNumber,
                    studentName: student.studentName,
                    age: student.age || 0,
                    sex: student.sex,
                    subjects: {
                        mathematics: {
                            ca: parseFloat(student.subjects.mathematics.ca) || 0,
                            exam: student.subjects.mathematics.exam
                        },
                        english: {
                            ca: parseFloat(student.subjects.english.ca) || 0,
                            exam: student.subjects.english.exam
                        },
                        generalKnowledge: {
                            ca: parseFloat(student.subjects.generalKnowledge.ca) || 0,
                            exam: student.subjects.generalKnowledge.exam
                        },
                        igbo: {
                            ca: parseFloat(student.subjects.igbo.ca) || 0,
                            exam: student.subjects.igbo.exam
                        }
                    }
                }))
            }))

            await uploadUBEATResults({ result: results }).unwrap()

            const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2)
            toast.dismiss()
            setUploadProgress(100)
            setProgressMessage('Upload complete!')
            await new Promise(r => setTimeout(r, 300))

            const uploadedKeys = new Set(recordsToUpload.map(recordKey))
            const newData = data.filter(r => !uploadedKeys.has(recordKey(r)))
            onDataChange(newData)
            setSelectedKeys(new Set())
            setFailedSchools([])

            const binHasContent = recycleBin.length > 0
            const tableHasRemaining = newData.length > 0

            if (tableHasRemaining || binHasContent) {
                toast.success(
                    `Uploaded ${recordsToUpload.length.toLocaleString()} records in ${elapsedTime}s.${tableHasRemaining ? ` ${newData.length.toLocaleString()} record${newData.length !== 1 ? 's' : ''} remaining in table.` : ''}${binHasContent ? ` ${recycleBin.length.toLocaleString()} record${recycleBin.length !== 1 ? 's' : ''} in recycle bin.` : ''}`
                )
            } else {
                toast.success(`Successfully saved ${recordsToUpload.length.toLocaleString()} UBEAT records to database in ${elapsedTime}s`)
                router.push('/exam-portal/dashboard/schools')
            }
        } catch (error) {
            console.error('Error saving UBEAT data:', error)
            toast.dismiss()
            toast.error('Failed to save UBEAT data to database. Please check your connection and try again.')
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
                                UBEAT Exam Data
                                {data.length > 0 && data[0]?.examYear && (
                                    <span className="ml-2 text-sm font-normal text-green-600">
                                        (Exam Year: {data[0].examYear})
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length.toLocaleString()} total records, {sortedData.length.toLocaleString()} showing
                                {(errorCounts.name_special_chars + errorCounts.exam_number_invalid + errorCounts.missing_required + errorCounts.incomplete_scores) > 0 && (
                                    <span className="ml-3 inline-flex gap-2">
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
                            {/* Recycle Bin button */}
                            <button
                                onClick={() => setShowRecycleBin(true)}
                                title="Open recycle bin"
                                className={`relative inline-flex items-center gap-2 px-3 py-2 border text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${recycleBin.length > 0
                                    ? 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 focus:ring-orange-500 cursor-pointer'
                                    : 'border-gray-200 text-gray-400 bg-white cursor-pointer hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-base">🗑️</span>
                                <span className="hidden sm:inline">Recycle Bin</span>
                                {recycleBin.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-orange-500 text-white text-[11px] font-bold leading-none">
                                        {recycleBin.length > 99 ? '99+' : recycleBin.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleSaveToDb}
                                disabled={isSaving}
                                title={selectedKeys.size > 0 ? `Upload ${selectedKeys.size} selected` : 'Upload all to database'}
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
                                ) : selectedKeys.size > 0 ? (
                                    <>
                                        <IoCloudUpload className="w-4 h-4 flex-shrink-0" />
                                        <span>Upload selected ({selectedKeys.size})</span>
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
                                title='Clear UBEAT Data'
                                className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                    }`}
                            >
                                <IoRefresh className="w-4 h-4" />
                            </button>
                            {selectedKeys.size > 0 && (
                                <>
                                    <button
                                        onClick={handleMoveSelectedToRecycleBin}
                                        disabled={isSaving}
                                        title={`Move ${selectedKeys.size} selected to recycle bin`}
                                        className={`inline-flex items-center gap-2 transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                            ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                            : 'border-orange-300 text-orange-700 bg-white hover:bg-orange-50 focus:ring-orange-500 cursor-pointer active:scale-90 active:rotate-1'
                                            }`}
                                    >
                                        <span>🗑️</span>
                                        <span>Bin ({selectedKeys.size})</span>
                                    </button>
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={isSaving}
                                        className={`inline-flex items-center transition-all duration-200 px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving
                                            ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                            : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500 cursor-pointer active:scale-90 active:rotate-1'
                                            }`}
                                    >
                                        <IoTrash className="w-4 h-4 mr-2" />
                                        Delete ({selectedKeys.size})
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {selectedKeys.size > 0 && (
                        <div className="mt-3 px-4 py-2 rounded-md bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                <span className="font-semibold">{selectedKeys.size} rows selected</span>
                                {' — green button will upload only these. Clear selection to upload all.'}
                            </p>
                        </div>
                    )}
                    {/* Sheets / files: open in modal to save space */}
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
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isSaving || data.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 cursor-pointer'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Override by File
                        </button>
                    </div>
                </div>

                {errorRecords.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                    ⚠️ Records with Errors ({errorRecords.length})
                                </span>
                                <span className="text-xs text-gray-500">
                                    (Excluded from upload)
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkExcludeErrors}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                                    title="Exclude all error records on current page"
                                >
                                    Exclude Page
                                </button>
                                <button
                                    onClick={handleBulkMoveErrorsToBin}
                                    className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded hover:bg-orange-50"
                                    title="Move error records to recycle bin"
                                >
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
                                                <span className="text-sm font-medium truncate">{record.studentName}</span>
                                                <span className="text-xs text-gray-500">({record.examNumber})</span>
                                            </div>
                                            <div className="flex gap-1 mt-0.5">
                                                {errors.slice(0, 2).map((e, i) => (
                                                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-white/80 border">
                                                        {e.message}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button
                                                onClick={() => handleCleanAndRestore(key)}
                                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                title="Auto-clean and restore"
                                            >
                                                Fix
                                            </button>
                                            <button
                                                onClick={() => handleExcludeError(key)}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                                                title="Keep excluded"
                                            >
                                                Exclude
                                            </button>
                                            <button
                                                onClick={() => handleIgnoreError(key)}
                                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                                title="Ignore and allow upload"
                                            >
                                                Ignore
                                            </button>
                                            <button
                                                onClick={() => handleMoveErrorToBin(key)}
                                                className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded hover:bg-orange-50"
                                                title="Move to recycle bin"
                                            >
                                                Bin
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                            {errorRecords.length > 20 && (
                                <p className="text-xs text-gray-500 text-center py-1">
                                    ... and {errorRecords.length - 20} more
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {ignoredRecords.length > 0 && (
                    <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700">
                                Ignored ({ignoredRecords.length}) — included in upload
                            </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {ignoredRecords.slice(0, 10).map((record) => {
                                const key = recordKey(record)
                                return (
                                    <div key={key} className="flex items-center justify-between p-2 rounded border border-purple-200 bg-white">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm truncate">{record.studentName}</span>
                                            <span className="text-xs text-gray-500 ml-2">({record.examNumber})</span>
                                        </div>
                                        <button
                                            onClick={() => handleUnignoreError(key)}
                                            className="px-2 py-1 text-xs border border-purple-300 text-purple-700 rounded hover:bg-purple-100"
                                            title="Restore to error group"
                                        >
                                            Unignore
                                        </button>
                                    </div>
                                )
                            })}
                            {ignoredRecords.length > 10 && (
                                <p className="text-xs text-purple-500 text-center">
                                    ... and {ignoredRecords.length - 10} more
                                </p>
                            )}
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
                                            checked={selectedKeys.size === sortedData.length && sortedData.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            disabled={isSaving}
                                            className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'}`}
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
                                    { key: 'serialNumber', label: 'S/NO' },
                                    { key: 'studentName', label: 'Name' },
                                    { key: 'examNumber', label: 'Exam No.' },
                                    { key: 'schoolName', label: 'School' },
                                    { key: 'lga', label: 'LGA' }
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key as keyof UBEATStudentRecord)}
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
                            {paginatedData.map((record) => {
                                const key = recordKey(record)
                                const isEditing = editingKey === key
                                const errors = record.validationErrors || []
                                const errorStyle = getErrorStyles(errors)
                                const hasError = !!errorStyle
                                return (
                                    <tr key={key} className={`hover:bg-gray-50 ${hasError ? `${errorStyle.bgClass} border-l-4 ${errorStyle.borderClass}` : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {hasError && (
                                                <div className="flex flex-col gap-1 mb-1">
                                                    {errors.slice(0, 2).map((e, i) => (
                                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border font-medium" title={e.message}>
                                                            {errorStyle.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <input
                                                type="checkbox"
                                                checked={selectedKeys.has(key)}
                                                onChange={(e) => handleSelectRow(key, e.target.checked, (e.nativeEvent as MouseEvent).shiftKey)}
                                                disabled={isSaving}
                                                className={`rounded text-green-600 focus:ring-green-500 ${isSaving ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'}`}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.serialNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                            {isEditing ? (
                                                <input
                                                    value={editDraft?.studentName ?? ''}
                                                    onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { studentName: '', examNumber: '', schoolName: '', lga: '' }), studentName: e.target.value }))}
                                                    disabled={isSaving}
                                                    className="w-full max-w-[240px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                />
                                            ) : (
                                                record.studentName.toLowerCase()
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    value={editDraft?.examNumber ?? ''}
                                                    onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { studentName: '', examNumber: '', schoolName: '', lga: '' }), examNumber: e.target.value }))}
                                                    disabled={isSaving}
                                                    className="w-full max-w-[200px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                />
                                            ) : (
                                                record.examNumber
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    value={editDraft?.schoolName ?? ''}
                                                    onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { studentName: '', examNumber: '', schoolName: '', lga: '' }), schoolName: e.target.value }))}
                                                    disabled={isSaving}
                                                    className="w-full max-w-[240px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                />
                                            ) : (
                                                <div className="max-w-32 truncate capitalize" title={record.schoolName}>
                                                    {record.schoolName.toLowerCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                            {isEditing ? (
                                                <input
                                                    value={editDraft?.lga ?? ''}
                                                    onChange={(e) => setEditDraft(prev => ({ ...(prev ?? { studentName: '', examNumber: '', schoolName: '', lga: '' }), lga: e.target.value }))}
                                                    disabled={isSaving}
                                                    className="w-full max-w-[180px] px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                />
                                            ) : (
                                                record.lga.toLowerCase()
                                            )}
                                        </td>
                                        <td className="py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center justify-end gap-2 px-3">
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
                                                        <button
                                                            onClick={() => handleMoveToRecycleBin(key)}
                                                            disabled={isSaving}
                                                            className={`p-1.5 rounded border border-transparent transition-all duration-200 ${isSaving
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-orange-500 hover:text-orange-700 active:scale-90 active:rotate-1 hover:bg-orange-50 hover:border-orange-100 cursor-pointer'
                                                                }`}
                                                            title="Move to recycle bin"
                                                        >
                                                            <span className="text-base leading-none">🗑️</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
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
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer">
                                First
                            </button>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer">
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                                if (pageNum > totalPages) return null
                                return (
                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm border rounded active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer ${currentPage === pageNum
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'border-gray-300 hover:bg-gray-100'
                                            }`}>
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer">
                                Next
                            </button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 active:rotate-1 transition-all duration-200 cursor-pointer">
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

            {/* Modals portaled outside the table */}
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
                                        Processing {(uploadingCountRef.current ?? uploadingCount ?? data.length).toLocaleString()} UBEAT records...
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
                            role="dialog" aria-modal="true" aria-labelledby="ubeat-files-modal-title"
                        >
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                    <h3 id="ubeat-files-modal-title" className="text-lg font-semibold text-gray-900">
                                        Sheets / files in this upload ({filesList.length})
                                    </h3>
                                    <button type="button" onClick={() => setShowFilesModal(false)}
                                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Close">
                                        <span className="text-xl leading-none">&times;</span>
                                    </button>
                                </div>
                                <p className="px-4 pt-2 text-xs text-gray-500">
                                    Remove an entire sheet/file from the table with the trash icon. Use checkboxes to upload only selected rows.
                                </p>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {filesList.map(({ fileName, count }) => (
                                            <span key={fileName} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                                                <span className="max-w-[240px] truncate text-gray-800" title={fileName}>{fileName}</span>
                                                <span className="text-amber-700 text-xs font-medium">({count})</span>
                                                <button type="button"
                                                    onClick={() => { handleRemoveFile(fileName); if (filesList.length <= 1) setShowFilesModal(false) }}
                                                    disabled={isSaving}
                                                    className="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    title="Remove this entire sheet/file">
                                                    <IoTrash className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showRecycleBin && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                            onClick={() => setShowRecycleBin(false)}
                            role="dialog" aria-modal="true" aria-labelledby="ubeat-recycle-bin-title"
                        >
                            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🗑️</span>
                                        <div>
                                            <h3 id="ubeat-recycle-bin-title" className="text-lg font-semibold text-gray-900">Recycle Bin</h3>
                                            <p className="text-xs text-gray-500">
                                                {recycleBin.length} record{recycleBin.length !== 1 ? 's' : ''} — these will NOT be uploaded
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setShowRecycleBin(false)}
                                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400" aria-label="Close">
                                        <span className="text-xl leading-none">&times;</span>
                                    </button>
                                </div>

                                {recycleBin.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-orange-50 border-b border-orange-100">
                                        <button onClick={() => { exportRecycleBinCsv(recycleBin); setRecycleBinExported(true) }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 active:scale-95 transition-all duration-150 cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download CSV ({recycleBin.length})
                                        </button>
                                        <button onClick={handleRestoreAll}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-300 text-blue-700 bg-white text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all duration-150 cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Restore All
                                        </button>
                                        <button onClick={handleEmptyRecycleBin}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-300 text-red-700 bg-white text-sm font-medium hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer ml-auto">
                                            <IoTrash className="w-4 h-4" />
                                            Empty Bin
                                        </button>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto">
                                    {recycleBin.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                            <span className="text-5xl mb-3">🗑️</span>
                                            <p className="text-sm font-medium">Recycle bin is empty</p>
                                            <p className="text-xs mt-1">Records moved here won&apos;t be uploaded</p>
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {['S/NO', 'Name', 'Exam No.', 'School', ''].map(h => (
                                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {recycleBin.map(record => {
                                                    const key = recordKey(record)
                                                    return (
                                                        <tr key={key} className="hover:bg-orange-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-gray-500">{record.serialNumber}</td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{record.studentName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{record.examNumber}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                <div className="max-w-[160px] truncate" title={record.schoolName}>{record.schoolName}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <button onClick={() => handleRestoreFromBin(key)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 text-blue-600 text-xs font-medium hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                                                                    title="Restore to table">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    Restore
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    )}
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