import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { School, Student } from '@/services/schoolService'
import { Application } from '@/lib/admin-schools/api'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
}

export interface Transaction {
  _id: string
  numberOfStudents: number
  totalAmount: number
  pointsAwarded: number
  paymentStatus: string
  createdAt: string
  paidAt?: string
  reference: string
  amountPerStudent: number
  paymentNotes?: string
  paystackTransactionId?: string
  school: {
    _id: string
    schoolName: string
    email: string
  }
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected' | 'completed'
}

export interface ApplicationsResponse {
  data: Application[]
}

// RTK Query API slice
export const schoolsApi = createApi({
  reducerPath: 'schoolsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('ngrok-skip-browser-warning', 'true')
      
      // Add auth token if available
      const token = localStorage.getItem('admin_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      return headers
    },
  }),
  tagTypes: ['School', 'Application', 'Transaction', 'Student'],
  endpoints: (builder) => ({
    // Get all schools with pagination and filters
    getSchools: builder.query<PaginatedResponse<School>, {
      page?: number
      limit?: number
      search?: string
      status?: string
    }>({
      query: ({ page = 1, limit = 10, search, status } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        
        if (search?.trim()) params.append('search', search.trim())
        if (status?.trim()) params.append('status', status.trim())
        
        return `schools?${params.toString()}`
      },
      providesTags: ['School'],
    }),

    // Get school by ID
    getSchoolById: builder.query<School, string>({
      query: (id) => `schools/${id}`,
      providesTags: (result, error, id) => [{ type: 'School', id }],
    }),

    // Get school transactions
    getSchoolTransactions: builder.query<{ data: Transaction[] }, string>({
      query: (schoolId) => `student-payments/school/${schoolId}`,
      providesTags: (result, error, schoolId) => [{ type: 'Transaction', id: schoolId }],
    }),

    // Get all applications
    getApplications: builder.query<{
      data: Application[]
      meta: {
        page: number
        totalPages: number
        total: number
        limit: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }, {
      page?: number
      limit?: number
      status?: 'not_applied' | 'all' | 'pending' | 'approved' | 'rejected' | 'onboarded' | 'completed'
      searchTerm?: string
    }>({
      query: ({ page = 1, limit = 20, status, searchTerm } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        
        // Add status filter to server-side query
        if (status) {
          params.append('status', status)
        }
        
        // Add search term to server-side query
        if (searchTerm?.trim()) {
          params.append('search', searchTerm.trim())
        }
        
        return `applications?${params.toString()}`
      },
      transformResponse: (response: { data?: Application[], meta?: { page?: string, totalPages?: string, total?: string, limit?: string, hasNextPage?: boolean, hasPrevPage?: boolean } }) => {
        // Return the full response with data and meta
        console.log(response)
        return {
          data: response.data || [],
          meta: {
            page: parseInt(response.meta?.page || '1') || 1,
            totalPages: parseInt(response.meta?.totalPages || '1') || 1,
            total: parseInt(response.meta?.total || '0') || 0,
            limit: parseInt(response.meta?.limit || '20') || 20,
            hasNextPage: response.meta?.hasNextPage || false,
            hasPrevPage: response.meta?.hasPrevPage || false
          }
        }
      },
      providesTags: ['Application'],
    }),

    // Get all students
    getAllStudents: builder.query<Student[], void>({
      query: () => 'students',
      providesTags: ['Student'],
    }),

    // Get students by school ID
    getStudentsBySchoolId: builder.query<Student[], string>({
      query: (schoolId) => `students/school/${schoolId}`,
      providesTags: (result, error, schoolId) => [
        { type: 'Student', id: schoolId },
        { type: 'Student', id: 'LIST' }
      ],
    }),

    // Get school names only
    getSchoolNames: builder.query<School[], void>({
      query: () => 'schools/names',
      providesTags: ['School'],
    }),

    // Update application status
    updateApplicationStatus: builder.mutation<unknown, {
      appIds: string | string[]
      status: 'approved' | 'rejected' | 'completed'
    }>({
      queryFn: async ({ appIds, status }, { getState }) => {
        const ids = Array.isArray(appIds) ? appIds : [appIds]
        const adminToken = localStorage.getItem('admin_token')
        
        try {
          const responses = await Promise.all(
            ids.map(async (appId) => {
              const response = await fetch(`${BASE_URL}/applications/${appId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status }),
              })
              
              if (!response.ok) {
                throw new Error(`Failed to update application ${appId} to ${status}`)
              }
              
              return response.json()
            })
          )
          
          return { data: responses }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error instanceof Error ? error.message : 'Unknown error' } }
        }
      },
      invalidatesTags: ['Application', 'School'],
    }),

    // Reapprove rejected application
    reapproveApplication: builder.mutation<Application, string>({
      query: (applicationId) => ({
        url: `applications/revert/${applicationId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'School'],
    }),

    // Admin login
    adminLogin: builder.mutation<{ accessToken: string; admin: { email: string } }, {
      email: string
      password: string
    }>({
      query: ({ email, password }) => ({
        url: 'admin/login',
        method: 'POST',
        body: { email, password },
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useGetSchoolTransactionsQuery,
  useGetApplicationsQuery,
  useGetAllStudentsQuery,
  useGetStudentsBySchoolIdQuery,
  useGetSchoolNamesQuery,
  useUpdateApplicationStatusMutation,
  useReapproveApplicationMutation,
  useAdminLoginMutation,
} = schoolsApi
