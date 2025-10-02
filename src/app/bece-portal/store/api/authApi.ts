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
  }),
})

export const {
  useAdminLoginMutation,
  useGetAdminProfileQuery,
  useAdminChangePasswordMutation,
} = authApi
