export interface Subject {
    name: string
    exam: number
    grade: string
}

export interface Student {
    _id: string
    name: string
    examNo: string
    school: string
    schoolName?: string
    subjects: Subject[]
    overallGrade: string
    totalCredits?: number
    createdAt: string
    updatedAt: string
    __v: number
}

export interface ResultsResponse {
    totalResults: number
    results: Student[]
    page: number
    limit: number
    totalPages: number
}

export interface School {
    _id: string
    schoolName: string
    lga: string | { _id: string; name: string }
    students: number // Number of students in the school
}

export interface BeceResultUploadResponse {
    message: string
    uploadedCount: number
    students?: Student[] // The actual students data from the results endpoint
}
