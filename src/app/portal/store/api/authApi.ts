import { apiSlice } from './apiSlice'

// School name response type
interface SchoolName {
  schoolName: string
  status: 'approved' | 'not applied' | 'pending' | 'applied' | 'rejected'
}

// School application types
interface SchoolApplicationRequest {
  schoolName: string
  address: string
  schoolCode: string
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

// Auth API endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get school names
    getSchoolNames: builder.query<SchoolName[], void>({
      query: () => 'https://43ccf5c37a8d.ngrok-free.app/schools/names',
      transformResponse: (response: SchoolName[]) => {
        const uniqueSchools = Array.from(
          new Set(response.map(school => school.schoolName))
        ).map(schoolName => {
          const originalSchool = response.find(s => s.schoolName === schoolName)
          return {
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
        url: 'https://43ccf5c37a8d.ngrok-free.app/applications',
        method: 'POST',
        body: applicationData,
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
  useSubmitSchoolApplicationMutation,
} = authApi
