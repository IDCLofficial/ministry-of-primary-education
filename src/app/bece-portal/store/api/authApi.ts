import { ResultsResponse, Student, UBEATResultsResponse } from '../../dashboard/schools/types/student.types'
import { apiSlice } from './apiSlice'

interface Admin {
  _id: string
  email: string
  percentage: number
  isActive: boolean
  lastLogin: string
  adminType: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  message: string
  admin: Admin
  accessToken: string
  tokenType: string
}

interface ProfileResponse {
  message: string
  admin: Admin
}


export interface BeceResultUpload{
  schoolName: string
  lga: string
  examYear: number
  students: Student[]
}

interface BeceResultUploadRequest {
  result: BeceResultUpload[]
  file: {fileName: string, fileSize: number, students: number}[]
}

interface BeceResultUploadResponse {
  message: string
  uploadedCount: number
}

// UBEAT Interfaces
export interface UBEATResultUpload {
  lga: string
  examYear: number
  schoolName: string
  students: {
    serialNumber: number
    examNumber: string
    studentName: string
    age: number
    sex: 'male' | 'female'
    subjects: {
      mathematics: {
        ca: number;
        exam: number;
      }
      english: {
        ca: number;
        exam: number;
      }
      generalKnowledge: {
        ca: number;
        exam: number;
      }
      igbo: {
        ca: number;
        exam: number;
      }
    }
  }[]
}

interface UBEATResultUploadRequest {
  result: UBEATResultUpload[]
}

interface UBEATResultUploadResponse {
  message: string
  uploadedCount: number
}

interface School {
  _id: string
  schoolName: string
  lga: string
  schoolCode: string
  students: any[]
  isFirstLogin: boolean
  hasAccount: boolean
  isVerified: boolean
  exams: any[]
  __v: number
  createdAt: string
  updatedAt: string
}

interface SchoolResponse {
  data: School[]
  pagination: {
    currentPage: string
    totalPages: number
    totalItems: number
    itemsPerPage: string
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface UpdateScoreSubject {
  subjectName: string
  exam: number
}

interface UpdateScoreRequest {
  examNo: string
  subjects: UpdateScoreSubject[]
}

interface UpdateScoreResponse {
  message: string
  student: Student
}

// UBEAT Update Score Interfaces
interface UBEATUpdateScoreSubject {
  subjectName: string
  ca: number
  exam: number
}

interface UBEATUpdateScoreRequest {
  examNo: string
  subjects: UBEATUpdateScoreSubject[]
}

interface UBEATUpdateScoreResponse {
  message: string
  student: any
}

export interface UploadLog {
  _id: string
  editor: string
  activity: string
  type: 'UPLOAD'
  timestamp: string
  status: 'processed' | 'pending' | 'error'
  subject: string
  subjectType: string
  fileName: string
  fileSize: string
  studentsAffected: number
  role: string
}

export interface UploadLogsResponse {
  data: UploadLog[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface UploadLogsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
}

export interface DashboardSummary {
  students: number
  resultUploaded: number
  totalSchools: number
  certificateGenerated: number
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin login
    adminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Admin'],
    }),

    // Get admin profile
    getAdminProfile: builder.query<ProfileResponse, void>({
      query: () => '/admin/profile',
      providesTags: ['Admin'],
    }),

    // Admin Change Password
    adminChangePassword: builder.mutation<void, void>({
      query: () => ({
        url: '/admin/changePassword',
        method: 'POST',
      }),
      invalidatesTags: ['Admin'],
    }),

    // Upload BECE CA Results
    uploadBeceResults: builder.mutation<BeceResultUploadResponse, BeceResultUploadRequest>({
      query: (data) => ({
        url: '/bece-result/upload',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', { type: 'Admin', id: 'UPLOAD_LOGS' }, { type: 'Admin', id: 'SUMMARY' }],
    }),
    
    // Upload BECE EXAMS Results
    uploadBeceExamResults: builder.mutation<BeceResultUploadResponse, BeceResultUploadRequest>({
      query: (data) => ({
        url: '/bece-result/upload',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', { type: 'Admin', id: 'UPLOAD_LOGS' }, { type: 'Admin', id: 'SUMMARY' }],
    }),

    // Upload UBEAT Results
    uploadUBEATResults: builder.mutation<UBEATResultUploadResponse, UBEATResultUploadRequest>({
      query: (data) => ({
        url: '/ubeat/upload',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', { type: 'Admin', id: 'UPLOAD_LOGS' }, { type: 'Admin', id: 'SUMMARY' }],
    }),
    
    // Fetch Results 
    getResults: builder.query<ResultsResponse, {
      schoolId: string;
      page?: number;
      limit?: number;
      search?: string;
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        const queryString = queryParams.toString()
        return `/bece-result/results/${params.schoolId.replace(/\//g, "-")}${queryString ? `?${queryString}` : ''}`
      },
      providesTags: (_result, _error, params) => [
        { type: 'Admin', id: 'LIST' },
        { type: 'Admin', id: params.schoolId }
      ],
    }),

    // Fetch Schools
    getSchools: builder.query<SchoolResponse, {
      page?: number;
      limit?: number;
      search?: string;
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params && params.page) queryParams.append('page', params.page.toString())
        if (params && params.limit) queryParams.append('limit', params.limit.toString())
        if (params && params.search) queryParams.append('search', params.search)
        return `/schools?${queryParams.toString()}`
      },
      providesTags: [{ type: 'Admin', id: 'SCHOOLS' }],
    }),

    // Get School by ID /schools/{id}
    getSchoolById: builder.query<School, string>({
      query: (schoolId) => `/schools/${schoolId.replace(/\//g, "-")}`,
      providesTags: (result, error, schoolId) => [{ type: 'Admin', id: schoolId }],
    }),

    // Update Student Score
    updateStudentScore: builder.mutation<UpdateScoreResponse, UpdateScoreRequest>({
      query: (data) => ({
        url: '/bece-result/update-score',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result) => [
        { type: 'Admin', id: 'LIST' },
        // Invalidate the specific school's results if we can determine it
        ...(result?.student?.school ? [{ type: 'Admin' as const, id: result.student.school }] : [])
      ],
    }),

    // Get UBEAT Results
    getUBEATResults: builder.query<UBEATResultsResponse, {
      schoolCode: string;
      page?: number;
      limit?: number;
      search?: string;
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        const queryString = queryParams.toString()
        return `/ubeat/results/${params.schoolCode.replace(/\//g, "-")}${queryString ? `?${queryString}` : ''}`
      },
      providesTags: (_result, _error, params) => [
        { type: 'Admin', id: 'UBEAT_LIST' },
        { type: 'Admin', id: `UBEAT_${params.schoolCode}` }
      ],
    }),

    // Update UBEAT Student Score
    updateUBEATScore: builder.mutation<UBEATUpdateScoreResponse, UBEATUpdateScoreRequest>({
      query: (data) => ({
        url: '/ubeat/update-score',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result) => [
        { type: 'Admin', id: 'UBEAT_LIST' },
        // Invalidate the specific school's results if we can determine it
        ...(result?.student?.school ? [{ type: 'Admin' as const, id: `UBEAT_${result.student.school}` }] : [])
      ],
    }),

    // Get Upload Logs
    getUploadLogs: builder.query<UploadLogsResponse, UploadLogsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params && params.page) queryParams.append('page', params.page.toString())
        if (params && params.limit) queryParams.append('limit', params.limit.toString())
        if (params && params.search) queryParams.append('search', params.search)
        if (params && params.status) queryParams.append('status', params.status)
        if (params && params.type) queryParams.append('type', params.type)
        
        const queryString = queryParams.toString()
        return `/bece-result/upload-logs${queryString ? `?${queryString}` : ''}`
      },
      providesTags: [{ type: 'Admin', id: 'UPLOAD_LOGS' }],
    }),

    // Get Dashboard Summary
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/bece-result/summary',
      providesTags: [{ type: 'Admin', id: 'SUMMARY' }],
    }),

  }),
})

export const {
  useAdminLoginMutation,
  useGetAdminProfileQuery,
  useAdminChangePasswordMutation,
  useUploadBeceResultsMutation,
  useUploadBeceExamResultsMutation,
  useUploadUBEATResultsMutation,
  useGetResultsQuery,
  useGetUBEATResultsQuery,
  useGetSchoolsQuery,
  useUpdateStudentScoreMutation,
  useUpdateUBEATScoreMutation,
  useGetUploadLogsQuery,
  useGetDashboardSummaryQuery,
  useGetSchoolByIdQuery,
} = authApi
