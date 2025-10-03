import { useState, useMemo } from 'react'
import { School } from '../types/student.types'

interface PaginationState {
    [schoolId: string]: number
}

export function useSchoolPagination(schools: School[], itemsPerPage: number = 5) {
    const [paginationState, setPaginationState] = useState<PaginationState>({})

    const paginatedSchools = useMemo(() => {
        return schools.map(school => {
            const currentPage = paginationState[school.id] || 1
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            
            return {
                ...school,
                paginatedStudents: school.students.slice(startIndex, endIndex),
                currentPage,
                totalPages: Math.ceil(school.students.length / itemsPerPage),
                totalStudents: school.students.length
            }
        })
    }, [schools, paginationState, itemsPerPage])

    const setSchoolPage = (schoolId: string, page: number) => {
        setPaginationState(prev => ({
            ...prev,
            [schoolId]: page
        }))
    }

    const resetPagination = () => {
        setPaginationState({})
    }

    return {
        paginatedSchools,
        setSchoolPage,
        resetPagination
    }
}
