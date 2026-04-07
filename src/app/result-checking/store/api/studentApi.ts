import { API_BASE_URL } from '@/app/portal/utils/constants/Api.const'
import { decryptApiResponseFrom, isApiResponseDecryptConfigured } from '@/lib/apiResponseFunnel'
import { apiSlice } from './apiSlice'
import { LgaEnum } from '@/app/portal/dashboard/[schoolCode]/types';
import { ExamTypeEnum } from '@/app/portal/store/api/authApi';

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
    _id?: string
    studentName: string
    examNumber: string
    age?: number
    sex?: string
    school?: string
    schoolName?: string
    lga?: string
    serialNumber?: number
    averageScore?: number
    grade?: string
    examYear?: number
    subjects?: {
        [key: string]: {
            ca: number
            exam: number
            total: number
            _id: string
        }
    }
    payment?: Payment
    // Direct payment fields (for alternative form response)
    paymentUrl?: string
    paymentReference?: string
    createdAt?: string
    updatedAt?: string
    __v?: number
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

// Match returned by find-my-result / find-exam-number endpoints
interface MatchedNames {
    studentName: string
    id: string
}

interface MatchedNamesResponseSuccess {
    statusCode: 200,
    data: MatchedNames[]
}

interface MatchedNamesResponseError {
    statusCode: 404 | 400 | 500 | 'FETCH_ERROR',
    message: string
}

export type FindResultMatch = MatchedNamesResponseSuccess | MatchedNamesResponseError;

// Find UBEAT result by student details (alternative form)
export interface FindResultRequest {
    schoolId: string
    examYear: number
    studentName: string
    lga: string
}

export interface CustomerSupport {
    fullName: string,
    lga: LgaEnum,
    schoolName: string,
    year: number,
    exam: ExamTypeEnum,
    reasonForContact: string,
    examNo?: string,
    phone: number,
    other?: string;
    email: string
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
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data !== 'string') return response as UBEATStudentResult
                if (!(await isApiResponseDecryptConfigured())) return response as UBEATStudentResult
                try {
                    return await decryptApiResponseFrom<UBEATStudentResult>(raw as { data: string }, 'data')
                } catch (e) {
                    console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                    return response as UBEATStudentResult
                }
            },
            providesTags: (result, error, examNo) => [
                { type: 'Students', id: `UBEAT-${examNo}` }
            ],
        }),

        // Find UBEAT result by student details
        findUBEATResult: builder.mutation<FindResultMatch, FindResultRequest>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/find-my-result`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { statusCode?: number; data?: unknown; message?: string }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as FindResultMatch
                    try {
                        return await decryptApiResponseFrom<FindResultMatch>(raw as { data: string }, 'data')
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as FindResultMatch
                    }
                }
                if (Array.isArray(raw?.data)) {
                    return { statusCode: raw?.statusCode ?? 200, data: raw.data } as FindResultMatch
                }
                return response as FindResultMatch
            },
        }),

        // Find BECE result by student details
        findBECEResult: builder.mutation<FindResultMatch, FindResultRequest>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/find-exam-number`,
                method: 'POST',
                body: data,
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { statusCode?: number; data?: unknown; message?: string }
                if (typeof raw?.data === 'string') {
                    if (!(await isApiResponseDecryptConfigured())) return response as FindResultMatch
                    try {
                        return await decryptApiResponseFrom<FindResultMatch>(raw as { data: string }, 'data')
                    } catch (e) {
                        console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                        return response as FindResultMatch
                    }
                }
                if (Array.isArray(raw?.data)) {
                    return { statusCode: raw?.statusCode ?? 200, data: raw.data } as FindResultMatch
                }
                return response as FindResultMatch
            },
        }),

        // Create BECE payment after student selection
        createBECEPayment: builder.mutation<{ paymentUrl: string; paymentReference: string }, { id: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/create-payment`,
                method: 'POST',
                body: data,
            }),
        }),

        // Create UBEAT payment after student selection
        createUBEATPayment: builder.mutation<{ paymentUrl: string; paymentReference: string }, { id: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/create-payment`,
                method: 'POST',
                body: data,
            }),
        }),

        customerSupport: builder.mutation<{ reference: string }, CustomerSupport>({
            query: (data) => ({
                url: `${API_BASE_URL}/customer-support/complain`,
                method: 'POST',
                body: data,
            }),
        }),

        setBecePaymentEmail: builder.mutation<{ status: number, message: string }, { paymentReference: string, email: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/bece-student/update-payment-email`,
                method: 'PATCH',
                body: data,
            }),
        }),

        setUbeatPaymentEmail: builder.mutation<{ status: number, message: string }, { paymentReference: string, email: string }>({
            query: (data) => ({
                url: `${API_BASE_URL}/ubeat/update-payment-email`,
                method: 'PATCH',
                body: data,
            }),
        }),

        // Get BECE student result by exam number
        getBECEResult: builder.query<BECEStudentResult, string>({
            query: (examNo) => ({
                url: `${API_BASE_URL}/bece-student/check-result/${encodeURIComponent(examNo.replace(/\s/g, '').replace(/\//g, '-'))}`,
                method: 'GET',
            }),
            transformResponse: async (response: unknown) => {
                const raw = response as { data?: unknown }
                if (typeof raw?.data !== 'string') return response as BECEStudentResult
                if (!(await isApiResponseDecryptConfigured())) return response as BECEStudentResult
                try {
                    return await decryptApiResponseFrom<BECEStudentResult>(raw as { data: string }, 'data')
                } catch (e) {
                    console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
                    return response as BECEStudentResult
                }
            },
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
    useFindBECEResultMutation,
    useCreateBECEPaymentMutation,
    useCreateUBEATPaymentMutation,
    useCustomerSupportMutation,
    useSetBecePaymentEmailMutation,
    useSetUbeatPaymentEmailMutation
} = studentApi
