export interface Subject {
    name: string
    exam: number
    grade: string
}

export interface Student {
    _id: string
    name: string
    isPaid: boolean
    examNo: string
    school: string
    schoolName?: string
    subjects: Subject[]
    overallGrade: string
    totalCredits?: number
    examYear?: number
    createdAt: string
    updatedAt: string
    __v: number
}

// Common interface for displaying students in tables
export interface DisplayStudent {
    _id: string
    name: string
    isPaid: boolean
    examNo: string
    school: string
    schoolName?: string
    subjects: Subject[]
    overallGrade: string
    examYear?: number
    createdAt: string
    updatedAt: string
    __v: number
    examType?: 'bece' | 'ubeat'
    originalData?: UBEATStudent // Store original UBEAT data for modal
}

export interface ResultsResponse {
    totalResults: number
    results: Student[]
    page: number
    limit: number
    totalPages: number
}

export interface UBEATStudent {
    _id: string
    examNumber: string
    studentName: string
    serialNumber: number
    isPaid: boolean
    age: number
    sex: 'male' | 'female'
    lga: string
    school: string
    schoolName: string
    examYear?: number
    subjects: {
        mathematics: {
            ca: number
            exam: number
            total: number
            _id: string
        }
        english: {
            ca: number
            exam: number
            total: number
            _id: string
        }
        generalKnowledge: {
            ca: number
            exam: number
            total: number
            _id: string
        }
        igbo: {
            ca: number
            exam: number
            total: number
            _id: string
        }
    }
    averageScore: number
    grade: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface UBEATResultsResponse {
    data: UBEATStudent[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}
export interface School {
    _id: string
    schoolName: string
    schoolCode: string
    lga: string | { _id: string; name: string }
}

export interface BeceResultUploadResponse {
    message: string
    uploadedCount: number
    students?: Student[] // The actual students data from the results endpoint
}

// Adapter functions
export function ubeatStudentToDisplayStudent(ubeatStudent: UBEATStudent): DisplayStudent {
    // Convert UBEAT subjects object to array of Subject
    const subjectsArray: Subject[] = [
        {
            name: 'Mathematics',
            exam: ubeatStudent.subjects.mathematics.total,
            grade: calculateGradeFromTotal(ubeatStudent.subjects.mathematics.total)
        },
        {
            name: 'English',
            exam: ubeatStudent.subjects.english.total,
            grade: calculateGradeFromTotal(ubeatStudent.subjects.english.total)
        },
        {
            name: 'General Knowledge',
            exam: ubeatStudent.subjects.generalKnowledge.total,
            grade: calculateGradeFromTotal(ubeatStudent.subjects.generalKnowledge.total)
        },
        {
            name: 'Igbo',
            exam: ubeatStudent.subjects.igbo.total,
            grade: calculateGradeFromTotal(ubeatStudent.subjects.igbo.total)
        }
    ]

    return {
        _id: ubeatStudent._id,
        name: ubeatStudent.studentName,
        isPaid: ubeatStudent.isPaid,
        examNo: ubeatStudent.examNumber,
        school: ubeatStudent.school,
        schoolName: ubeatStudent.schoolName,
        subjects: subjectsArray,
        overallGrade: ubeatStudent.grade,
        createdAt: ubeatStudent.createdAt,
        updatedAt: ubeatStudent.updatedAt,
        __v: ubeatStudent.__v,
        examType: 'ubeat',
        originalData: ubeatStudent // Store original data for modal
    }
}

function calculateGradeFromTotal(total: number): string {
    if (total >= 80) return 'A'
    if (total >= 70) return 'B'
    if (total >= 60) return 'C'
    if (total >= 50) return 'D'
    if (total >= 40) return 'E'
    return 'F'
}
