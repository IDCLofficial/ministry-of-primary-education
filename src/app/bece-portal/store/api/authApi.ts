import { ResultsResponse, Student } from '../../dashboard/schools/types/student.types'
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
  students: Student[]
}

interface BeceResultUploadRequest {
  result: BeceResultUpload[]
  type: "ca" | "exam",
  file: {fileName: string, fileSize: number, students: number}[]
}

interface BeceResultUploadResponse {
  message: string
  uploadedCount: number
}

interface School {
  _id: string
  schoolName: string
  lga: string | { _id: string; name: string },
  students: number,
}

interface SchoolResponse {
  totalSchools: number
  schools: School[]
  totalPages: number
  page: number
  limit: number
}

interface UpdateScoreSubject {
  subjectName: string
  ca?: number
  exam?: number
}

interface UpdateScoreRequest {
  examNo: string
  subjects: UpdateScoreSubject[]
}

interface UpdateScoreResponse {
  message: string
  student: Student
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
        return `/bece-result/results/${params.schoolId}${queryString ? `?${queryString}` : ''}`
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
        return `/bece-school?${queryParams.toString()}`
      },
      providesTags: [{ type: 'Admin', id: 'SCHOOLS' }],
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
  useGetResultsQuery,
  useGetSchoolsQuery,
  useUpdateStudentScoreMutation,
  useGetUploadLogsQuery,
  useGetDashboardSummaryQuery,
} = authApi
