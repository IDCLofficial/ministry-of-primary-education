import { API_BASE_URL, endpoints } from '../../utils/constants/Api.const'
import { apiSlice } from './apiSlice'

// School name response type
interface SchoolName {
  _id: string
  schoolName: string
  status: 'approved' | 'not applied' | 'pending' | 'applied' | 'rejected'
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
    schoolCode: string
    email: string
    isFirstLogin: boolean
  }
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
  }),
  overrideExisting: true,
})

export const {
  useGetSchoolNamesQuery,
  useSubmitSchoolApplicationMutation,
  useLoginMutation,
} = authApi
