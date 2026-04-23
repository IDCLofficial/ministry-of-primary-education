'use client'

import React, { useState, useMemo } from 'react'
import { IoClose } from 'react-icons/io5'
import toast from 'react-hot-toast'

interface ValidationError {
  type: string
  field: string
  message: string
}

interface ErrorTypeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  errorType: string
  records: any[]
  onCleanAndRestore: (key: string, updated: any) => void
  onIgnore: (key: string) => void
  onUnignore?: (key: string) => void
  onMoveToBin: (key: string) => void
  onExclude: (key: string) => void
  onDataChange: (data: any[]) => void
  validateRecord: (record: any) => ValidationError[]
}

const recordKey = (r: any) => `${r.examNo}\0${r.file.name}`

const errorTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  name_special_chars: { color: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Name with Invalid Characters' },
  exam_number_invalid: { color: 'text-red-700', bgColor: 'bg-red-50', label: 'Invalid Exam Number' },
  missing_required: { color: 'text-orange-700', bgColor: 'bg-orange-50', label: 'Missing Required Fields' },
  incomplete_scores: { color: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Missing/Incomplete Scores' },
}

export default function ErrorTypeModal({
  isOpen,
  onClose,
  title,
  errorType,
  records,
  onCleanAndRestore,
  onIgnore,
  onMoveToBin,
  onExclude,
  onDataChange,
  validateRecord
}: ErrorTypeModalProps) {
  const config = errorTypeConfig[errorType] || { color: 'text-gray-700', bgColor: 'bg-gray-50', label: title }
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ name: string; examNo: string; schoolName: string } | null>(null)

  const filteredRecords = useMemo(() => {
    if (!search) return records
    const t = search.toLowerCase()
    return records.filter(r => r.name?.toLowerCase().includes(t) || r.examNo?.toLowerCase().includes(t))
  }, [records, search])

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedKeys(new Set(filteredRecords.map(recordKey)))
    else setSelectedKeys(new Set())
  }

  const handleSelectRow = (key: string, checked: boolean) => {
    const next = new Set(selectedKeys)
    if (checked) next.add(key)
    else next.delete(key)
    setSelectedKeys(next)
  }

  const handleCleanSingle = (record: any) => {
    const key = recordKey(record)
    const updated = {
      ...record,
      name: record.name?.replace(/[^a-zA-Z\s\-'."\u2018\u2019\u02BC]/g, '').trim() || '',
      examNo: record.examNo?.replace(/[^a-zA-Z0-9\/\\\-]/g, '').trim() || '',
    }
    const errors = validateRecord(updated)
    if (errors.length === 0) {
      onCleanAndRestore(key, updated)
    } else {
      toast.error('Record still has errors after cleaning')
    }
  }

  const handleBulkClean = async () => {
    setProcessing(true)
    let cleaned = 0
    for (const record of filteredRecords) {
      const key = recordKey(record)
      const updated = {
        ...record,
        name: record.name?.replace(/[^a-zA-Z\s\-'."\u2018\u2019\u02BC]/g, '').trim() || '',
        examNo: record.examNo?.replace(/[^a-zA-Z0-9\/\\\-]/g, '').trim() || '',
      }
      const errors = validateRecord(updated)
      if (errors.length === 0) {
        onCleanAndRestore(key, updated)
        cleaned++
      }
    }
    setProcessing(false)
    toast.success(`Cleaned ${cleaned} records`)
  }

  const handleBulkIgnore = () => {
    filteredRecords.forEach(r => onIgnore(recordKey(r)))
    toast.success(`Ignored ${filteredRecords.length} records`)
  }

  const handleBulkMoveToBin = () => {
    filteredRecords.forEach(r => onMoveToBin(recordKey(r)))
    toast.success(`Moved ${filteredRecords.length} records to recycle bin`)
  }

  const handleBulkSelectAndAction = async (action: 'ignore' | 'bin' | 'exclude') => {
    setProcessing(true)
    for (const key of selectedKeys) {
      switch (action) {
        case 'ignore': onIgnore(key); break
        case 'bin': onMoveToBin(key); break
        case 'exclude': onExclude(key); break
      }
    }
    setProcessing(false)
    setSelectedKeys(new Set())
    toast.success(`${action === 'bin' ? 'Moved to bin' : action === 'exclude' ? 'Excluded' : 'Ignored'} ${selectedKeys.size} records`)
  }

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return
    const headers = ['S/No', 'Name', 'Exam No', 'School Name', 'LGA', 'Error Type']
    const rows = filteredRecords.map((r, idx) => [
      idx + 1,
      r.name || '',
      r.examNo || '',
      r.schoolName || '',
      r.lga || '',
      config.label
    ].map(v => `"${String(v).replace(/"/g, '""')}"`))
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bece-${errorType}-errors-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully')
  }

  const startEditing = (record: any) => {
    const key = recordKey(record)
    setEditingKey(key)
    setEditDraft({
      name: record.name || '',
      examNo: record.examNo || '',
      schoolName: record.schoolName || ''
    })
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditDraft(null)
  }

  const saveEditing = (record: any) => {
    if (!editDraft) return
    const key = recordKey(record)
    const updated = {
      ...record,
      name: editDraft.name,
      examNo: editDraft.examNo,
      schoolName: editDraft.schoolName
    }
    const errors = validateRecord(updated)
    if (errors.length === 0) {
      onCleanAndRestore(key, updated)
      cancelEditing()
    } else {
      toast.error('Record still has validation errors')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${config.bgColor}`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-semibold ${config.color}`}>{config.label}</h2>
            <span className="text-sm text-gray-500">({records.length} records)</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between gap-4 mb-3">
            <input type="text" placeholder="Search by name or exam number..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-3 py-2 border rounded-md text-sm" />
            <button onClick={handleExportCSV} disabled={filteredRecords.length === 0} className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export CSV
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleBulkClean} disabled={processing || filteredRecords.length === 0} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
              <span>🔧</span> Clean All ({filteredRecords.length})
            </button>
            <button onClick={handleBulkIgnore} disabled={processing || filteredRecords.length === 0} className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1">
              <span>👁️</span> Ignore All
            </button>
            <button onClick={handleBulkMoveToBin} disabled={processing || filteredRecords.length === 0} className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1">
              <span>🗑️</span> Bin All
            </button>
          </div>
        </div>

        {selectedKeys.size > 0 && (
          <div className="px-6 py-2 bg-purple-50 border-b flex items-center justify-between">
            <span className="text-sm text-purple-700 font-medium">✓ {selectedKeys.size} selected</span>
            <div className="flex gap-2">
              <button onClick={async () => {
                setProcessing(true)
                let cleaned = 0
                for (const key of selectedKeys) {
                  const record = filteredRecords.find(r => recordKey(r) === key)
                  if (!record) continue
                  const updated = {
                    ...record,
                    name: record.name?.replace(/[^a-zA-Z\s\-'."\u2018\u2019\u02BC]/g, '').trim() || '',
                    examNo: record.examNo?.replace(/[^a-zA-Z0-9\/\\\-]/g, '').trim() || '',
                  }
                  const errors = validateRecord(updated)
                  if (errors.length === 0) {
                    onCleanAndRestore(key, updated)
                    cleaned++
                  }
                }
                setProcessing(false)
                setSelectedKeys(new Set())
                toast.success(`Cleaned ${cleaned} of ${selectedKeys.size} selected records`)
              }} disabled={processing} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">🔧 Clean</button>
              <button onClick={() => handleBulkSelectAndAction('ignore')} disabled={processing} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">👁️ Ignore</button>
              <button onClick={() => handleBulkSelectAndAction('bin')} disabled={processing} className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600">🗑️ Bin</button>
              <button onClick={() => handleBulkSelectAndAction('exclude')} disabled={processing} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100">Exclude</button>
              <button onClick={() => setSelectedKeys(new Set())} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">Clear</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" checked={selectedKeys.size === filteredRecords.length && filteredRecords.length > 0} onChange={e => handleSelectAll(e.target.checked)} className="rounded text-green-600" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S/No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record: any, idx: number) => {
                const key = recordKey(record)
                const isSelected = selectedKeys.has(key)
                const isEditing = editingKey === key
                return (
                  <tr key={key} className={`${isSelected ? 'bg-purple-50' : config.bgColor} hover:bg-gray-100`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={isSelected} onChange={e => handleSelectRow(key, e.target.checked)} className="rounded" /></td>
                    <td className="px-4 py-3 text-sm">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {isEditing ? (
                        <input type="text" value={editDraft?.name || ''} onChange={e => setEditDraft(prev => ({ ...prev!, name: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
                      ) : (
                        record.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input type="text" value={editDraft?.examNo || ''} onChange={e => setEditDraft(prev => ({ ...prev!, examNo: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
                      ) : (
                        record.examNo
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm truncate max-w-[200px]">
                      {isEditing ? (
                        <input type="text" value={editDraft?.schoolName || ''} onChange={e => setEditDraft(prev => ({ ...prev!, schoolName: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
                      ) : (
                        record.schoolName
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEditing(record)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" title="Save">Save</button>
                            <button onClick={cancelEditing} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100" title="Cancel">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(record)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" title="Edit">Edit</button>
                            <button onClick={() => handleCleanSingle(record)} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700" title="Auto-clean">Fix</button>
                            <button onClick={() => onIgnore(key)} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700" title="Ignore">Ignore</button>
                            <button onClick={() => onMoveToBin(key)} className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600" title="Bin">Bin</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredRecords.length === 0 && <div className="p-8 text-center text-gray-500">No records with this error type</div>}
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex justify-between">
          <span className="text-sm text-gray-500">{filteredRecords.length} records showing</span>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  )
}