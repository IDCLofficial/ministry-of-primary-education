import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../../utils/constants/Api.const'

// Base API slice for BECE portal
export const apiSlice = createApi({
  reducerPath: 'beceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage or state
      const token = localStorage.getItem('bece_access_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Admin', 'Schools', 'Students', 'Exams'],
  endpoints: () => ({}),
})

export default apiSlice
