import { useMemo, useEffect, useState } from 'react'
import { useGetSchoolsQuery } from '../../../store/api/authApi'
import { School, Student } from '../types/student.types'
import { API_BASE_URL } from '../../../utils/constants/Api.const'

export interface SchoolWithStudents extends School {
    students: Student[]
    isLoading: boolean
    error?: string
}

interface StudentsData {
    [schoolId: string]: {
        students: Student[]
        isLoading: boolean
        error?: string
    }
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

export function useSchoolsWithStudents() {
    const { 
        data: schools = [], 
        isLoading: schoolsLoading, 
        error: schoolsError 
    } = useGetSchoolsQuery()

    const [studentsData, setStudentsData] = useState<StudentsData>({})

    // Fetch students for each school when schools are loaded
    useEffect(() => {
        if (schoolsLoading || schools.length === 0) return

        const fetchAllStudents = async () => {
            const newStudentsData: StudentsData = {}

            // Initialize loading state for all schools
            schools.forEach(school => {
                newStudentsData[school._id] = {
                    students: [],
                    isLoading: true,
                    error: undefined
                }
            })
            setStudentsData(newStudentsData)

            // Fetch students for each school
            const fetchPromises = schools.map(async (school) => {
                try {
                    const students = await fetchStudentsForSchool(school._id)
                    console.log(students)
                    setStudentsData(prev => ({
                        ...prev,
                        [school._id]: {
                            students,
                            isLoading: false,
                            error: undefined
                        }
                    }))
                } catch (error) {
                    setStudentsData(prev => ({
                        ...prev,
                        [school._id]: {
                            students: [],
                            isLoading: false,
                            error: error instanceof Error ? error.message : 'Failed to load students'
                        }
                    }))
                }
            })

            await Promise.allSettled(fetchPromises)
        }

        fetchAllStudents()
    }, [schools, schoolsLoading])

    const schoolsWithStudents: SchoolWithStudents[] = useMemo(() => {
        return schools.map((school) => {
            const schoolStudentsData = studentsData[school._id] || {
                students: [],
                isLoading: false,
                error: undefined
            }

            return {
                ...school,
                students: schoolStudentsData.students,
                isLoading: schoolStudentsData.isLoading,
                error: schoolStudentsData.error
            }
        })
    }, [schools, studentsData])

    const isLoading = schoolsLoading || Object.values(studentsData).some(data => data.isLoading)
    const hasError = !!schoolsError || Object.values(studentsData).some(data => data.error)

    const totalStudents = useMemo(() => {
        return schoolsWithStudents.reduce((sum, school) => sum + school.students.length, 0)
    }, [schoolsWithStudents])

    const firstError = schoolsError || Object.values(studentsData).find(data => data.error)?.error

    return {
        schools: schoolsWithStudents,
        isLoading,
        hasError,
        totalStudents,
        error: firstError
    }
}
