export interface Subject {
    name: string
    exam: number
    ca: number
}

export interface Student {
    _id: string
    name: string
    examNo: string
    sex: string
    age: number
    school: string
    subjects: Subject[]
    createdAt: string
    updatedAt: string
    __v: number
}

export interface School {
    _id: string
    schoolName: string
    lga: string | { _id: string; name: string }
    studentCount: number
    students?: Student[] // Optional as it will be fetched separately
}

export interface BeceResultUploadResponse {
    message: string
    uploadedCount: number
    students?: Student[] // The actual students data from the results endpoint
}
