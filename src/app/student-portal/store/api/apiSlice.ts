import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moe-backend-production-3842.up.railway.app'

// Base API slice for Student Portal
export const apiSlice = createApi({
    reducerPath: 'studentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { endpoint } ) => {
            const token = localStorage.getItem('access_token');
            // Add ngrok header for external API calls
            // Student portal endpoints don't require authentication
            const skipAuthEndpoints = [
                'login', 
                'registerSchool', 
                'submitSchoolApplication', 
                'getSchoolNames',
                'getUBEATResult',
                'getBECEResult',
                'findUBEATResult'
            ]
            headers.set('ngrok-skip-browser-warning', 'true')
            if (!skipAuthEndpoints.includes(endpoint)) {
                if (!token) {
                    throw new Error('No authentication token found')
                }
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['School', 'Students'],
    endpoints: () => ({}),
})

// Export hooks for usage in functional components
export const { } = apiSlice