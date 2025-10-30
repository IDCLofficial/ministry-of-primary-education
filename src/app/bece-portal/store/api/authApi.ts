import { Student } from '../../dashboard/students/types/student.types'
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


interface BeceResultUpload{
  schoolName: string
  lga: string
  students: Student[]
}

interface BeceResultUploadRequest {
  result: BeceResultUpload[]
  type: "ca" | "exam"
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
      invalidatesTags: ['Admin'],
    }),
    
    // Upload BECE EXAMS Results
    uploadBeceExamResults: builder.mutation<BeceResultUploadResponse, BeceResultUploadRequest>({
      query: (data) => ({
        url: '/bece-result/upload',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    
    // Fetch Results 
    getResults: builder.query<Student[], string>({
      query: (schoolId: string) => {
        return `/bece-result/results/${schoolId}`
      },
      providesTags: (result, error, schoolId) => [
        { type: 'Admin', id: 'LIST' },
        { type: 'Admin', id: schoolId }
      ],
    }),

    // Fetch Schools
    getSchools: builder.query<School[], void>({
      query: () => '/bece-school',
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
} = authApi
