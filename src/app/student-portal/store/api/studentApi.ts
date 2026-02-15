import { API_BASE_URL } from '@/app/portal/utils/constants/Api.const';
import { apiSlice } from './apiSlice'

// TypeScript interfaces for API responses

interface PaymentPaid {
    isPaid: true;
}

interface PaymentUnpaid {
    isPaid: false
    paymentReference: string
    paymentUrl: string
}

type Payment = PaymentPaid | PaymentUnpaid;

// UBEAT Student Result
export interface UBEATStudentResult {
    _id: string
    studentName: string
    examNumber: string
    age: number
    sex: string
    school: string
    schoolName: string
    lga: string
    serialNumber: number
    averageScore: number
    grade: string
    examYear?: number
    subjects: {
        [key: string]: {
            ca: number
            exam: number
            total: number
            _id: string
        }
    }
    payment: Payment
    createdAt: string
    updatedAt: string
    __v: number
}

// BECE Student Result
export interface BECEStudentResult {
    _id: string
    name: string
    examNo: string
    age: number
    sex: string
    school: string
    schoolName: string
    lga: string
    subjects: Array<{
        name: string
        exam: number
        ca: number
        total: number
        grade: string
    }>
    overallGrade: string
    totalCredits: number
    payment?: Payment
    createdAt: string
    updatedAt: string
}

// Find UBEAT result by student details (alternative form)
export interface FindUBEATResultRequest {
    schoolId: string
    examYear: number
    studentName: string
    lga: string
}

// Extend the apiSlice with student portal endpoints
export const studentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get UBEAT student result by exam number
        getUBEATResult: builder.query<UBEATStudentResult, string>({
            query: (examNo) => ({
                url: `${API_BASE_URL}/ubeat/result/${encodeURIComponent(examNo.replace(/\s/g, '').replace(/\//g, '-'))}`,
                method: 'GET',
            }),
            providesTags: (result, error, examNo) => [
                { type: 'Students', id: `UBEAT-${examNo}` }
            ],
        }),

        // Find UBEAT result by student details
        findUBEATResult: builder.mutation<UBEATStudentResult, FindUBEATResultRequest>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/find-my-result`,
                method: 'POST',
                body: data,
            }),
        }),

        // Get BECE student result by exam number
        getBECEResult: builder.query<BECEStudentResult, string>({
            query: (examNo) => ({
                url: `${API_BASE_URL}/bece-student/check-result/${encodeURIComponent(examNo.replace(/\s/g, '').replace(/\//g, '-'))}`,
                method: 'GET',
            }),
            providesTags: (result, error, examNo) => [
                { type: 'Students', id: `BECE-${examNo}` }
            ],
        }),
    }),
    overrideExisting: true,
})

// Export hooks for usage in functional components
export const {
    useGetUBEATResultQuery,
    useGetBECEResultQuery,
    useLazyGetUBEATResultQuery,
    useLazyGetBECEResultQuery,
    useFindUBEATResultMutation,
} = studentApi
