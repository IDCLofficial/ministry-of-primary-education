import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../../utils/constants/Api.const'
import { getExamPortalToken } from '@/app/student-portal/utils/secureStorage'

// Base API slice for BECE portal
export const apiSlice = createApi({
  reducerPath: 'beceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getExamPortalToken()
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
