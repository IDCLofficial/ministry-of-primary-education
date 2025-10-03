export interface Student {
    id: string
    examNo: string
    firstName: string
    lastName: string
    gender: 'Male' | 'Female'
    dateOfBirth: string
    class: string
}

export interface School {
    id: string
    name: string
    location: string
    students: Student[]
}
