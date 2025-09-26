import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Base API slice
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers) => {
            // Add ngrok header for external API calls
            headers.set('ngrok-skip-browser-warning', 'true')
            return headers
        },
    }),
    tagTypes: ['School', 'Students'],
    endpoints: () => ({}),
})

// Export hooks for usage in functional components
export const { } = apiSlice