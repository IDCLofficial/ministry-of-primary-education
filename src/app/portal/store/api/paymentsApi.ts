import { apiSlice } from './apiSlice'

// Payments API endpoints
export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: () => ({
    // Add API endpoints as needed
  }),
})

// Export hooks for usage in functional components
export const {} = paymentsApi
