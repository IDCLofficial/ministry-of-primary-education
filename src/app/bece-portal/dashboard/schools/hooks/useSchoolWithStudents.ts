import { useEffect, useState } from 'react'
import { School, Student } from '../types/student.types'
import { API_BASE_URL } from '../../../utils/constants/Api.const'

interface UseSchoolWithStudentsResult {
    school: School | null
    students: Student[]
    isLoading: boolean
    hasError: boolean
    error?: string
}

// Helper function to fetch school details
const fetchSchool = async (schoolId: string): Promise<School> => {
    const token = localStorage.getItem('bece_access_token')
    
    const response = await fetch(`${API_BASE_URL}/school/${schoolId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch school ${schoolId}`)
    }

    const data = await response.json()
    return data
}

// Helper function to fetch students for a school
const fetchStudentsForSchool = async (schoolId: string): Promise<Student[]> => {
    const token = localStorage.getItem('bece_access_token')
    
    const response = await fetch(`${API_BASE_URL}/bece-result/results/${schoolId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch students for school ${schoolId}`)
    }

    const data = await response.json()
    return data || []
}

export function useSchoolWithStudents(schoolId: string): UseSchoolWithStudentsResult {
    const [school, setSchool] = useState<School | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (!schoolId) {
            setIsLoading(false)
            return
        }

        const fetchData = async () => {
            setIsLoading(true)
            setError(undefined)

            try {
                // Fetch school and students in parallel
                const [schoolData, studentsData] = await Promise.all([
                    fetchSchool(schoolId),
                    fetchStudentsForSchool(schoolId)
                ])

                setSchool(schoolData)
                setStudents(studentsData)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load school data'
                setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [schoolId])

    return {
        school,
        students,
        isLoading,
        hasError: !!error,
        error
    }
}
