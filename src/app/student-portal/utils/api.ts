import { ExamTypeEnum } from "@/app/portal/store/api/authApi"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moe-backend-production-3842.up.railway.app'

export interface Subject {
    name: string
    ca: number
    exam: number
}

export interface StudentResult {
    _id: string
    examNo: string
    name: string
    school: string
    lga: string
    subjects: Subject[]
    createdAt: string
    updatedAt: string
}

export interface StudentData {
    examNo: string
    name: string
    school: string
    lga: string
    subjects: {
        name: string
        exam: number
        total: number
        grade: string
    }[]
    overallGrade: string
    totalCredits: number
}

const calculateGrade = (total: number): string => {
    if (total >= 80) return 'A1'
    if (total >= 70) return 'B2'
    if (total >= 65) return 'B3'
    if (total >= 60) return 'C4'
    if (total >= 55) return 'C5'
    if (total >= 50) return 'C6'
    if (total >= 45) return 'D7'
    if (total >= 40) return 'E8'
    return 'F9'
}

const calculateOverallGrade = (subjects: StudentData['subjects']): string => {
    const gradePoints: { [key: string]: number } = {
        'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
        'D7': 7, 'E8': 8, 'F9': 9
    }

    const totalPoints = subjects.reduce((sum, subject) => {
        return sum + (gradePoints[subject.grade] || 9)
    }, 0)

    const average = totalPoints / subjects.length
    if (average <= 1.5) return 'Distinction'
    if (average <= 2.5) return 'Credit'
    if (average <= 4.5) return 'Pass'
    return 'Fail'
}

// Payment related interfaces
export interface PaymentStatus {
    paid: boolean
    studentName: string
    school: string
}

export interface CreatePaymentResponse {
    authorizationUrl: string
}

export interface VerifyPaymentResponse {
    reference: string
    paymentStatus: 'successful' | 'failed' | 'pending'
    studentName?: string
    school?: string
    paidAt?: string
    paymentMethod: string
    paymentNotes: string
    examNumber: string
    examYear: number
    paystackResponse: {
        metadata?: {
            custom_fields?: Array<{
                display_name: string
                variable_name: string
                value: string
            }>
        }
        [key: string]: unknown
    }
    paystackTransactionId: string
}

// Check payment status
export async function checkPaymentStatus(examNo: string): Promise<PaymentStatus> {
    const response = await fetch(`${API_BASE_URL}/result-payment/status?examNo=${encodeURIComponent(examNo)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })

    if (!response.ok) {
        const errorMessage = response.status === 404
            ? 'Payment status not found'
            : 'Failed to check payment status'
        throw new Error(errorMessage)
    }

    const data: PaymentStatus = await response.json()
    return data
}

// Create payment
export async function createPayment(examNo: string, examType: ExamTypeEnum): Promise<CreatePaymentResponse> {
    console.log({ examNo, examType, url: `${API_BASE_URL}/result-payment/create` })
    const response = await fetch(`${API_BASE_URL}/result-payment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ examNo, examType }),
    })

    if (!response.ok) {
        throw new Error('Failed to create payment')
    }

    const data: CreatePaymentResponse = await response.json()
    return data
}

// Verify payment
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/result-payment/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to verify payment')
    }

    const data: VerifyPaymentResponse = await response.json()
    return data
}

export async function checkStudentResult(examNo: string): Promise<StudentData> {
    const response = await fetch(`${API_BASE_URL}/bece-student/check-result/${encodeURIComponent(examNo)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })

    if (response.status !== 200) {
        let errorMessage = 'Failed to fetch student results'

        try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
        } catch {
            // If response is not JSON, use status-based messages
            if (response.status === 404) {
                errorMessage = 'Student not found with the provided examination number'
            } else if (response.status === 400) {
                errorMessage = 'Invalid examination number format'
            } else if (response.status === 500) {
                errorMessage = 'Server error. Please try again later.'
            } else {
                errorMessage = `Error ${response.status}: ${response.statusText || 'Failed to fetch student results'}`
            }
        }

        console.error('API Error:', { status: response.status, message: errorMessage })
        throw new Error(errorMessage)
    }

    const data: StudentResult = await response.json()

    if (!data || !data.examNo) {
        throw new Error('Invalid response from server')
    }

    const subjects = data.subjects.map(subject => {
        const total = subject.exam
        return {
            name: subject.name,
            exam: subject.exam,
            total,
            grade: calculateGrade(total)
        }
    })

    const totalCredits = subjects.filter(s =>
        s.grade.startsWith('A') ||
        s.grade.startsWith('B') ||
        s.grade.startsWith('C')
    ).length

    return {
        examNo: data.examNo,
        name: data.name,
        school: data.school || 'School Information Not Available',
        lga: data.lga || 'LGA Information Not Available',
        subjects,
        overallGrade: calculateOverallGrade(subjects),
        totalCredits
    }
}
