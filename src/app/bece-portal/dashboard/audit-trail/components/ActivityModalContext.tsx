'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface AuditLog {
    id: string
    timestamp: string
    user: string
    userRole: string
    action: 'upload' | 'download' | 'delete' | 'view' | 'create' | 'update' | 'login' | 'logout'
    resource: string
    resourceType: 'file' | 'student' | 'certificate' | 'account' | 'system'
    details: string
    ipAddress: string
    status: 'success' | 'failed' | 'warning'
    metadata?: {
        fileSize?: string
        studentsAffected?: number
        previousValue?: string
        newValue?: string
    }
}

interface ActivityModalContextType {
    selectedLog: AuditLog | null
    isOpen: boolean
    openModal: (log: AuditLog) => void
    closeModal: () => void
}

const ActivityModalContext = createContext<ActivityModalContextType | undefined>(undefined)

interface ActivityModalProviderProps {
    children: ReactNode
}

export function ActivityModalProvider({ children }: ActivityModalProviderProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const openModal = (log: AuditLog) => {
        setSelectedLog(log)
        setIsOpen(true)
    }

    const closeModal = () => {
        setSelectedLog(null)
        setIsOpen(false)
    }

    return (
        <ActivityModalContext.Provider value={{
            selectedLog,
            isOpen,
            openModal,
            closeModal
        }}>
            {children}
        </ActivityModalContext.Provider>
    )
}

export function useActivityModal() {
    const context = useContext(ActivityModalContext)
    if (context === undefined) {
        throw new Error('useActivityModal must be used within an ActivityModalProvider')
    }
    return context
}
