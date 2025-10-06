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

interface Subject {
  name: string
  exam: number
  ca: number
}

interface Student {
  name: string
  examNo: string
  sex: string
  age: number
  subjects: Subject[]
}

interface BeceResultUpload{
  schoolName: string
  lga: string
  students: Student[]
}

interface BeceResultUploadRequest {
  result: BeceResultUpload[]
}

interface BeceResultUploadResponse {
  message: string
  uploadedCount: number
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
    
    // Fetch Results 
    getResults: builder.query<BeceResultUploadResponse, string>({
      query: (schoolId: string) => {
        return `/bece-result/results/${schoolId}`
      },
      providesTags: ['Admin'],
    }),

  }),
})

export const {
  useAdminLoginMutation,
  useGetAdminProfileQuery,
  useAdminChangePasswordMutation,
  useUploadBeceResultsMutation,
  useGetResultsQuery,
} = authApi
