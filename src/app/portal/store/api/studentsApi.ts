import { apiSlice } from './apiSlice'

// Students API endpoints
export const studentsApi = apiSlice.injectEndpoints({
  endpoints: () => ({
    // Add API endpoints as needed
  }),
})

// Export hooks for usage in functional components
export const {} = studentsApi
