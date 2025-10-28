import { useMemo } from 'react'
import { School } from '../types/student.types'

export function useStudentFiltering(schools: School[], searchQuery: string) {
    const filteredSchools = useMemo(() => {
        return schools.map(school => ({
            ...school,
            students: (school.students || []).filter(student =>
                searchQuery === '' ||
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.examNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(school => (school.students || []).length > 0 || searchQuery === '')
    }, [schools, searchQuery])

    const totalStudents = useMemo(() => {
        return schools.reduce((sum, school) => sum + (school.students || []).length, 0)
    }, [schools])

    return {
        filteredSchools,
        totalStudents
    }
}
