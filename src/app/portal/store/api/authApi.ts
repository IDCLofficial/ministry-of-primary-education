import { API_BASE_URL, endpoints } from '../../utils/constants/Api.const'
import { apiSlice } from './apiSlice'

// School name response type
interface SchoolName {
  _id: string
  schoolName: string
  status: 'approved' | 'not applied' | 'pending' | 'applied' | 'rejected'
}

// Student response type
interface Student {
  _id: string
  studentId: number | string
  studentName: string
  gender: 'male' | 'female'
  class: string
  examYear: number
  paymentStatus: 'paid' | 'unpaid' | 'pending'
  onboardingStatus: 'onboarded' | 'pending' | 'not_onboarded'
  school: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Students response with pagination
interface StudentsResponse {
  data: Student[]
  currentPage: number
  totalPages: number
  totalItems: number
}

// School application types
interface SchoolApplicationRequest {
  schoolId: string
  address: string
  principal: string
  email: string
  phone: number
  numberOfStudents: number
}

interface SchoolApplicationResponse {
  message: string
  error?: string
  statusCode?: number
}

// Login types
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  school: {
    id: string
    schoolName: string
    email: string
    isFirstLogin: boolean
    status: string
    address: string
    totalPoints: number
    availablePoints: number
    usedPoints: number
    numberOfStudents: number
  }
}

// Student Payment interfaces
interface StudentPaymentRequest {
  numberOfStudents: number
  amountPerStudent: number
}

interface StudentPaymentResponse {
  success: boolean
  data: {
    _id: string
    school: object
    numberOfStudents: number
    amountPerStudent: number
    totalAmount: number
    pointsAwarded: number
    paymentStatus: string
    reference: string
    authorizationUrl: string
  }
  message: string
}

// Payment Verification interfaces
interface PaymentVerificationResponse {
  success: boolean
  data: {
    _id: string
    paymentStatus: 'successful' | 'failed' | 'pending'
    totalAmount: number
    numberOfStudents: number
    pointsAwarded: number
    paidAt: string
  }
  message: string
}

// Student Onboarding interfaces
interface StudentOnboardingRequest {
  studentName: string
  gender: 'male' | 'female'
  class: string
  examYear: number
  school: string
}

interface StudentOnboardingResponse {
  studentId: number
  studentName: string
  gender: string
  class: string
  examYear: number
  paymentStatus: string
  onboardingStatus: string
  school: string
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Application Status Update interfaces
interface ApplicationStatusUpdateRequest {
  status: 'completed'
  reviewNotes?: string
}

interface ApplicationStatusUpdateResponse {
  message: string
  success: boolean
}

// Auth API endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get school names
    getSchoolNames: builder.query<SchoolName[], void>({
      query: () => `${API_BASE_URL}${endpoints.GET_SCHOOL_NAMES}`,
      transformResponse: (response: SchoolName[]) => {
        const uniqueSchools = Array.from(
          new Set(response.map(school => school.schoolName))
        ).map(schoolName => {
          const originalSchool = response.find(s => s.schoolName === schoolName)
          return {
            _id: originalSchool?._id || '',
            schoolName,
            status: originalSchool?.status || 'not applied' as const
          }
        })

        return uniqueSchools.sort((a, b) => 
          a.schoolName.localeCompare(b.schoolName)
        )
      },
      providesTags: ['School'],
    }),

    // Submit school application
    submitSchoolApplication: builder.mutation<SchoolApplicationResponse, SchoolApplicationRequest>({
      query: (applicationData) => ({
        url: `${API_BASE_URL}${endpoints.SUBMIT_SCHOOL_APPLICATION}`,
        method: 'POST',
        body: applicationData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (loginData) => ({
        url: `${API_BASE_URL}${endpoints.LOGIN}`,
        method: 'POST',
        body: loginData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Get profile
    getProfile: builder.query<LoginResponse['school'], void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.PROFILE}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Get students by school ID
    getStudentsBySchool: builder.query<StudentsResponse, { schoolId: string; page?: number; limit?: number }>({
      query: ({ schoolId, page = 1, limit = 12 }) => ({
        url: `${API_BASE_URL}${endpoints.GET_STUDENTS_BY_SCHOOL}/${schoolId}?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Students'],
    }),

    // Create student payment
    createStudentPayment: builder.mutation<StudentPaymentResponse, { schoolId: string; paymentData: StudentPaymentRequest }>({
      query: ({ schoolId, paymentData }) => ({
        url: `${API_BASE_URL}${endpoints.CREATE_STUDENT_PAYMENT}/${schoolId}`,
        method: 'POST',
        body: paymentData,
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Students'],
    }),

    // Verify payment
    verifyPayment: builder.query<PaymentVerificationResponse, string>({
      query: (reference) => ({
        url: `${API_BASE_URL}${endpoints.VERIFY_PAYMENT}/${reference}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Students'],
    }),

    // Onboard student
    onboardStudent: builder.mutation<StudentOnboardingResponse, StudentOnboardingRequest>({
      query: (studentData) => ({
        url: `${API_BASE_URL}${endpoints.ONBOARD_STUDENT}`,
        method: 'POST',
        body: studentData,
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Students'],
    }),

    // Update application status
    updateApplicationStatus: builder.mutation<ApplicationStatusUpdateResponse, { applicationId: string; data: ApplicationStatusUpdateRequest }>({
      query: ({ applicationId, data }) => ({
        url: `${API_BASE_URL}${endpoints.UPDATE_APPLICATION_STATUS}/${applicationId}/status`,
        method: 'PATCH',
        body: data,
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetSchoolNamesQuery,
  useSubmitSchoolApplicationMutation,
  useLoginMutation,
  useGetProfileQuery,
  useGetStudentsBySchoolQuery,
  useCreateStudentPaymentMutation,
  useVerifyPaymentQuery,
  useOnboardStudentMutation,
  useUpdateApplicationStatusMutation,
} = authApi

// Export types for use in components
export type { Student, SchoolName, StudentPaymentRequest, StudentPaymentResponse, PaymentVerificationResponse, StudentOnboardingRequest, StudentOnboardingResponse, StudentsResponse, ApplicationStatusUpdateRequest, ApplicationStatusUpdateResponse }
