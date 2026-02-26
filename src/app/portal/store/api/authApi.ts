import { API_BASE_URL, endpoints } from '../../utils/constants/Api.const'
import { apiSlice } from './apiSlice'

// School name response type
interface SchoolName {
  _id: string
  schoolName: string
  hasAccount: boolean
  schoolCode: string
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
}

interface RejectedExamData extends ExamDataMain {
  status: 'rejected';
  reviewNotes: string;
}

type ExamData = ExamDataMain | RejectedExamData;

interface LoginResponse {
  access_token: string
  school: {
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

// Student Update interfaces
interface StudentUpdateRequest {
  studentName: string
  gender: 'male' | 'female'
  examYear: number
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
    getSchoolNames: builder.query<SchoolName[], { lga: string }>({
      query: ({ lga }) => `${API_BASE_URL}${endpoints.GET_SCHOOL_NAMES}?lga=${lga.toLowerCase()}`,
      transformResponse: (response: SchoolName[]) => {
        const uniqueSchools = Array.from(
          new Map(
            response.map(school => [school.schoolName, school])
          ).values()
        )

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
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
            'Content-Type': 'application/json',
          },
        };
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
    onboardStudent: builder.mutation<StudentOnboardingResponse, { examType: string; studentData: StudentOnboardingRequest }>({
      query: ({ examType, studentData }) => ({
        url: `${API_BASE_URL}${endpoints.ONBOARD_STUDENT}?examType=${examType}`,
        method: 'POST',
        body: { ...studentData },
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
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
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
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
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
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
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
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
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
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
  useCreateStudentPaymentMutation,
  useVerifyPaymentQuery,
  useOnboardStudentMutation,
  useUpdateStudentMutation,
  useUpdateApplicationStatusMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetTokenMutation,
} = authApi

// Export types for use in components
export type { Student, SchoolName, SchoolByCodeResponse, StudentPaymentRequest, StudentPaymentResponse, PaymentVerificationResponse, StudentOnboardingRequest, StudentOnboardingResponse, StudentUpdateRequest, StudentUpdateResponse, StudentsResponse, ApplicationStatusUpdateRequest, ApplicationStatusUpdateResponse, ExamDataMain as ExamData }
