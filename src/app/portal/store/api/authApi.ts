import { apiSlice } from './apiSlice'

// School name response type
interface SchoolName {
  schoolName: string
}

// Auth API endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get school names
    getSchoolNames: builder.query<SchoolName[], void>({
      query: () => 'https://3a9e36e7a9e0.ngrok-free.app/schools/names',
      transformResponse: (response: SchoolName[]) => {
        console.log('Response:', response)
        // Remove duplicates and sort alphabetically
        const uniqueSchools = Array.from(
          new Set(response.map(school => school.schoolName))
        ).map(schoolName => ({ schoolName }))

        // Log the unique schools
        console.log('Unique schools:', uniqueSchools)
        
        return uniqueSchools.sort((a, b) => 
          a.schoolName.localeCompare(b.schoolName)
        )
      },
      providesTags: ['School'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetSchoolNamesQuery,
} = authApi
