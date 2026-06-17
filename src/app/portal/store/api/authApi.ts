import { decryptApiResponseFrom, isApiResponseDecryptConfigured } from '@/lib/apiResponseFunnel'
import { API_BASE_URL, endpoints } from '../../utils/constants/Api.const'
import { apiSlice } from './apiSlice'
import { getPortalToken } from '@/app/result-checking/utils/secureStorage'

// School name response type
interface SchoolName {
  _id: string
  schoolName: string
  hasAccount: boolean
  schoolCode: string
  isFlagged?: boolean
  remainingAmount?: number
  flagReason?: string
}

// Flagged school response type
interface FlaggedSchool {
  id: string
  schoolName: string
  schoolCode: string
  flaggedExams: string[]
}

// Balance payment reconciliation interfaces
interface BalancePaymentRequest {
  examType: string
  numberOfStudents: number
  amountPaid: number
  flagReason: string
  schoolId: string
}

interface BalancePaymentResponse {
  authorizationUrl: string
}

// School by code response type
interface SchoolByCodeResponse {
  _id: string
  schoolName: string
  lga: string
  schoolCode: string
  email?: string
  address?: string
  principal?: string
  phone?: string
  students: string[]
  isFirstLogin: boolean
  hasAccount: boolean
  isVerified: boolean
  exams: ExamData[]
  createdAt: string
  updatedAt: string
  __v: number
  accessTokens?: string[]
  addedBySystem?: boolean
}

// Student response type
interface Student {
  _id: string
  studentId: number | string
  studentName: string
  gender: 'male' | 'female'
  class: string
  examYear: number
  age?: number
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

// Exam Type Enum
export enum ExamTypeEnum {
  UBEGPT = 'UBEGPT',
  UBETMS = 'UBETMS',
  COMMON_ENTRANCE = 'Common-entrance',
  BECE = 'BECE',
  BECE_RESIT = 'BECE-resit',
  UBEAT = 'UBEAT',
  JSCBE = 'JSCBE',
  WAEC = 'WAEC'
}

// Initial school application (no exam type)
interface InitialSchoolApplicationRequest {
  schoolId: string
  address: string
  principal: string
  email: string
  phone: number
  numberOfStudents: number
}

// Exam-specific application (with exam type)
interface ExamApplicationRequest {
  examType: ExamTypeEnum
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

// Add school (AEE) interfaces
interface AddSchoolRequest {
  schoolName: string
  address: string
  schoolCode: string
  principal: string
  email: string
  phone: string
}

interface AddSchoolResponse {
  message: string
  schoolId: string
  schoolCode: string
}

// Paid school entry returned by GET /schools/get-my-paid-schools
export interface PaidSchool {
  _id: string
  schoolName: string
  schoolCode: string
  exams: ExamDataMain[]
}

export interface PaidSchoolsPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaidSchoolsResponse {
  data: PaidSchool[]
  pagination: PaidSchoolsPagination
}

// Update school (AEE) interfaces
interface UpdateSchoolRequest {
  schoolName?: string
  address?: string
  schoolCode?: string
  principal?: string
  phone?: string
}

interface UpdateSchoolResponse {
  message: string
}

interface HideSchoolResponse {
  message: string
}

// Registration types
export interface RegistrationRequest {
  fullName: string
  lga: string
  email: string
  phoneNumber: string
}

interface RegistrationResponse {
  message: string
  error?: string
  statusCode?: number
}

// Login types
interface LoginRequest {
  email: string
  password: string
}

export interface ExamDataMain {
  applicationId: string;
  name: string;
  status: 'not applied' | 'pending' | 'approved' | 'rejected' | 'completed' | "onboarded";
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  numberOfStudents: number;
  aeeId: string;
  reviewNotes: string;
  successfulPaymentCount: number;
  lastPointsEarned: string;
  amountPaid: number;
  flagReason?: string;
  isFlagged?: boolean;
  remainingAmount?: number;
}

interface RejectedExamData extends ExamDataMain {
  status: 'rejected';
  reviewNotes: string;
}

type ExamData = ExamDataMain | RejectedExamData;

interface LoginResponse {
  access_token: string
  aee: {
    id: string
    email: string
    isFirstLogin: boolean
    lga: string
    totalSchoolsInLga: number
  }
}

// Student Payment interfaces
interface StudentPaymentRequest {
  examType: string
  numberOfStudents: number
}

interface StudentPaymentResponse {
  authorizationUrl: string
}

// Payment Verification interfaces
interface PaymentVerificationResponse {
  success: boolean
  data: {
    _id: string
    school: {
      _id: string
      schoolName: string
      lga: string
      schoolCode: string
      email?: string
      address?: string
      principal?: string
      phone?: string
      [key: string]: any
    }
    numberOfStudents: number
    examType: string
    amountPerStudent: number
    totalAmount: number
    pointsAwarded: number
    paymentStatus: 'successful' | 'failed' | 'pending'
    reference: string
    createdAt: string
    updatedAt: string
    authorizationUrl?: string
    paystackResponse?: any
    paidAt?: string
    paymentMethod?: string
    paymentNotes?: string
    paystackTransactionId?: string
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
  age?: number
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

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

interface BulkStudentPayload {
  studentName: string
  gender: Gender
  class: string
  examYear: number
  age?: number
}

interface BulkCreateOnboardingPayload {
  school: string
  students: BulkStudentPayload[]
}

// Student Update interfaces
interface StudentUpdateRequest {
  studentName: string
  gender: 'male' | 'female'
  examYear: number
  age?: number
}

interface StudentUpdateResponse {
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

// Application Status Update interfaces
interface ApplicationStatusUpdateRequest {
  status: 'onboarded' | 'completed'
  reviewNotes?: string
}

interface ApplicationStatusUpdateResponse {
  authorizationUrl: string
  reference: string
}

interface CreatePasswordRequest {
  newPassword: string,
  confirmPassword: string
}

interface CreatePasswordResponse {
  message: string
}

// Change Password interfaces
interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  message: string
}

// Delete Account interfaces
interface DeleteAccountResponse {
  message: string
}

// Forgot Password interfaces
interface ForgotPasswordRequest {
  email: string
}

interface ForgotPasswordResponse {
  message: string
}

// Reset Password interfaces
interface ResetPasswordRequest {
  token: string
  newPassword: string
}

interface ResetPasswordResponse {
  message: string
}

// Verify Reset Token interfaces
interface VerifyResetTokenRequest {
  token: string
}

interface VerifyResetTokenResponse {
  valid: boolean
  message: string
}

// Auth API endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get school names
    getSchoolNames: builder.query<SchoolName[], { lga: string; withAuth?: boolean }>({
      query: ({ lga, withAuth }) => withAuth
        ? {
            url: `${API_BASE_URL}${endpoints.GET_SCHOOL_NAMES}?lga=${lga.toLowerCase()}`,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${getPortalToken() ?? ''}`,
              'Content-Type': 'application/json',
            },
          }
        : `${API_BASE_URL}${endpoints.GET_SCHOOL_NAMES}?lga=${lga.toLowerCase()}`,
      transformResponse: (response: SchoolName[]) => {
        // Track which schools were kept and which were removed
        const schoolNameCounts = new Map<string, SchoolName[]>()

        // Group schools by name to identify duplicates
        response.forEach(school => {
          const existing = schoolNameCounts.get(school.schoolName) || []
          existing.push(school)
          schoolNameCounts.set(school.schoolName, existing)
        })

        // The Map approach keeps the LAST occurrence of each duplicate
        const schoolMap = new Map(
          response.map(school => [school.schoolName, school])
        )
        const uniqueSchools = Array.from(schoolMap.values())

        return uniqueSchools.sort((a, b) =>
          a.schoolName.localeCompare(b.schoolName)
        )
      },
      providesTags: ['School'],
    }),

    // Get school by code
    getSchoolByCode: builder.query<SchoolByCodeResponse, string>({
      query: (schoolCode) => `${API_BASE_URL}${endpoints.GET_SCHOOL_BY_CODE(schoolCode)}`,
      providesTags: ['School'],
    }),

    // Get LGAs
    getLGAs: builder.query<string[], void>({
      query: () => `${API_BASE_URL}${endpoints.GET_LGAS}`,
      providesTags: ['School'],
    }),

    // Submit initial school application (no exam type)
    submitSchoolApplication: builder.mutation<SchoolApplicationResponse, InitialSchoolApplicationRequest>({
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

    // Submit exam-specific application (with exam type)
    submitExamApplication: builder.mutation<SchoolApplicationResponse, ExamApplicationRequest>({
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

    // Register school
    registerSchool: builder.mutation<RegistrationResponse, RegistrationRequest>({
      query: (registrationData) => ({
        url: `${API_BASE_URL}${endpoints.REGISTER}`,
        method: 'POST',
        body: registrationData,
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
      transformResponse: async (response: unknown) => {
        const raw = response as { data?: unknown }
        if (typeof raw?.data !== 'string') return response as LoginResponse
        if (!(await isApiResponseDecryptConfigured())) return response as LoginResponse
        try {
          return await decryptApiResponseFrom<LoginResponse>(raw as { data: string }, 'data')
        } catch (e) {
          console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
          return response as LoginResponse
        }
      },
    }),

    // Logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.LOGOUT}`,
        method: 'POST',
      }),
    }),

    // Create password
    createPassword: builder.mutation<CreatePasswordResponse, CreatePasswordRequest>({
      query: (createPasswordData) => ({
        url: `${API_BASE_URL}${endpoints.CREATE_PASSWORD}`,
        method: 'PATCH',
        body: createPasswordData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Get profile
    getProfile: builder.query<LoginResponse['aee'], void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.PROFILE}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: async (response: unknown) => {
        const raw = response as { data?: unknown }
        if (typeof raw?.data !== 'string') return response as LoginResponse['aee']
        if (!(await isApiResponseDecryptConfigured())) return response as LoginResponse['aee']
        try {
          return await decryptApiResponseFrom<LoginResponse['aee']>(raw as { data: string }, 'data')
        } catch (e) {
          console.warn('apiResponseFunnel: decrypt failed, using raw response. Check API_RESPONSE_DECRYPT_SECRET and backend key/salt match.', e)
          return response as LoginResponse['aee']
        }
      },
    }),

    // Get students by school ID
    getStudentsBySchool: builder.query<StudentsResponse, { examType: ExamTypeEnum; schoolId: string; page?: number; limit?: number; sort?: string; class?: string; year?: number; gender?: string, searchTerm?: string }>({
      query: ({ examType, schoolId, page = 1, limit = 12, sort, class: className, year, gender, searchTerm }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (sort) params.append('sort', sort);
        if (className) params.append('class', className);
        if (year) params.append('year', year.toString());
        if (gender) params.append('gender', gender);
        if (searchTerm) params.append('searchTerm', searchTerm);

        return {
          url: `${API_BASE_URL}${endpoints.GET_STUDENTS_BY_SCHOOL(examType, schoolId)}/?${params.toString()}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getPortalToken() ?? ''}`,
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Students'],
    }),

    // Get ALL students by school ID (for export). The backend caps `limit` at
    // 100, so we page through in chunks of 100 and aggregate, rather than
    // requesting `limit=totalItems` (which 400s for schools with >100 students).
    getAllStudentsBySchool: builder.query<StudentsResponse, { examType: ExamTypeEnum; schoolId: string }>({
      async queryFn({ examType, schoolId }, _queryApi, _extraOptions, baseQuery) {
        const PAGE_SIZE = 100
        const headers = {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        }
        const buildUrl = (page: number) =>
          `${API_BASE_URL}${endpoints.GET_STUDENTS_BY_SCHOOL(examType, schoolId)}/?page=${page}&limit=${PAGE_SIZE}`

        // Fetch the first page to learn how many pages exist.
        const firstResult = await baseQuery({ url: buildUrl(1), method: 'GET', headers })
        if (firstResult.error) return { error: firstResult.error }

        const firstPage = firstResult.data as StudentsResponse
        const totalPages = firstPage.totalPages || 1
        let students = [...(firstPage.data || [])]

        // Fetch any remaining pages in parallel and concatenate.
        if (totalPages > 1) {
          const remaining = []
          for (let page = 2; page <= totalPages; page++) {
            remaining.push(baseQuery({ url: buildUrl(page), method: 'GET', headers }))
          }
          const results = await Promise.all(remaining)
          for (const result of results) {
            if (result.error) return { error: result.error }
            students = students.concat((result.data as StudentsResponse).data || [])
          }
        }

        return {
          data: {
            data: students,
            currentPage: 1,
            totalPages,
            totalItems: firstPage.totalItems ?? students.length,
          } as StudentsResponse,
        }
      },
      providesTags: ['Students'],
    }),

    // Create student payment
    createStudentPayment: builder.mutation<StudentPaymentResponse, { schoolId: string; paymentData: StudentPaymentRequest }>({
      query: ({ schoolId, paymentData }) => ({
        url: `${API_BASE_URL}${endpoints.CREATE_STUDENT_PAYMENT}/${schoolId}`,
        method: 'POST',
        body: paymentData,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
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
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      providesTags: ['Students'],
    }),

    // Onboard student
    onboardStudent: builder.mutation<StudentOnboardingResponse, { examType: string; studentData: StudentOnboardingRequest }>({
      query: ({ examType, studentData }) => ({
        url: `${API_BASE_URL}${endpoints.ONBOARD_STUDENT}?examType=${examType}`,
        method: 'POST',
        body: { ...studentData },
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Students'],
    }),

    // Bulk onboard students
    bulkOnboardStudents: builder.mutation<StudentOnboardingResponse[], { examType: string; data: BulkCreateOnboardingPayload }>({
      query: ({ examType, data }) => ({
        url: `${API_BASE_URL}/onboarding/bulk?examType=${examType}`,
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Students'],
    }),

    // Update student
    updateStudent: builder.mutation<StudentUpdateResponse, { id: string; examType: ExamTypeEnum; data: StudentUpdateRequest }>({
      query: ({ id, examType, data }) => ({
        url: `${API_BASE_URL}/students/${id}?examType=${examType}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Students'],
    }),

    // Update application status
    updateApplicationStatus: builder.mutation<ApplicationStatusUpdateResponse, { applicationId: string; examType: ExamTypeEnum; data: ApplicationStatusUpdateRequest }>({
      query: ({ applicationId, examType, data }) => ({
        url: `${API_BASE_URL}${endpoints.UPDATE_APPLICATION_STATUS}/${applicationId}/status?examType=${examType}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Change password
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: `${API_BASE_URL}${endpoints.CHANGE_PASSWORD}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Delete account
    deleteAccount: builder.mutation<DeleteAccountResponse, void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.DELETE_ACCOUNT}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Forgot password
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: `${API_BASE_URL}${endpoints.FORGOT_PASSWORD}`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: `${API_BASE_URL}${endpoints.RESET_PASSWORD}`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Verify reset token
    verifyResetToken: builder.mutation<VerifyResetTokenResponse, VerifyResetTokenRequest>({
      query: (data) => ({
        url: `${API_BASE_URL}${endpoints.VERIFY_RESET_TOKEN}`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Load exams data
    loadExamsData: builder.query<unknown, void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.LOAD_EXAMS_DATA}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Load exams data
    getMyPaidSchools: builder.query<unknown, void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.GET_MY_PAID_SCHOOLS}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Get all paid-school entries for the logged-in AEE
    getMyPaidSchoolsTransactions: builder.query<PaidSchoolsResponse, void>({
      query: () => ({
        url: `${API_BASE_URL}${endpoints.GET_MY_PAID_SCHOOLS}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: unknown): PaidSchoolsResponse => {
        const r = response as { data?: unknown; pagination?: unknown }
        const defaultPagination: PaidSchoolsPagination = {
          currentPage: 1, totalPages: 1, totalItems: 0,
          itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false,
        }
        return {
          data: Array.isArray(r?.data) ? (r.data as PaidSchool[]) : [],
          pagination: (r?.pagination as PaidSchoolsPagination) ?? defaultPagination,
        }
      },
      providesTags: ['School'],
    }),

    // Get flagged schools for AEE's LGA
    getFlaggedSchools: builder.query<FlaggedSchool[], { lga: string }>({
      query: ({ lga }) => `${API_BASE_URL}/schools/flaggedSchools?lga=${lga.toLowerCase()}`,
      providesTags: ['School'],
    }),

    // Add a school (AEE)
    addSchool: builder.mutation<AddSchoolResponse, AddSchoolRequest>({
      query: (schoolData) => ({
        url: `${API_BASE_URL}${endpoints.ADD_SCHOOL}`,
        method: 'POST',
        body: schoolData,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Update a school (AEE)
    updateSchool: builder.mutation<UpdateSchoolResponse, { id: string; data: UpdateSchoolRequest }>({
      query: ({ id, data }) => ({
        url: `${API_BASE_URL}${endpoints.UPDATE_SCHOOL(id)}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Hide (disable) a school — backend will no longer return it
    hideSchool: builder.mutation<HideSchoolResponse, { id: string }>({
      query: ({ id }) => ({
        url: `${API_BASE_URL}${endpoints.HIDE_SCHOOL(id)}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getPortalToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['School'],
    }),

    // Reconcile balance payment for flagged school
    reconcileBalancePayment: builder.mutation<BalancePaymentResponse, BalancePaymentRequest>({
      query: (paymentData) => ({
        url: `${API_BASE_URL}/student-payments/balance-payment`,
        method: 'POST',
        body: paymentData,
        headers: {
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
  useGetSchoolByCodeQuery,
  useGetLGAsQuery,
  useSubmitSchoolApplicationMutation,
  useSubmitExamApplicationMutation,
  useRegisterSchoolMutation,
  useLoginMutation,
  useCreatePasswordMutation,
  useGetProfileQuery,
  useGetStudentsBySchoolQuery,
  useGetAllStudentsBySchoolQuery,
  useCreateStudentPaymentMutation,
  useVerifyPaymentQuery,
  useBulkOnboardStudentsMutation,
  useOnboardStudentMutation,
  useUpdateStudentMutation,
  useUpdateApplicationStatusMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetTokenMutation,
  useLoadExamsDataQuery,
  useGetMyPaidSchoolsQuery,
  useGetFlaggedSchoolsQuery,
  useReconcileBalancePaymentMutation,
  useAddSchoolMutation,
  useUpdateSchoolMutation,
  useHideSchoolMutation,
  useGetMyPaidSchoolsTransactionsQuery
} = authApi

// Export types for use in components
export type { Student, SchoolName, FlaggedSchool, SchoolByCodeResponse, StudentPaymentRequest, StudentPaymentResponse, PaymentVerificationResponse, StudentOnboardingRequest, StudentOnboardingResponse, StudentUpdateRequest, StudentUpdateResponse, StudentsResponse, ApplicationStatusUpdateRequest, ApplicationStatusUpdateResponse, ExamDataMain as ExamData }