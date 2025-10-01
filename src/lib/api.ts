import { Student } from '@/services/schoolService'

// Base URL for the API
export const BASE_URL = 'https://moe-backend-nwp2.onrender.com'

// Status types for school applications
export type SchoolStatus = 'applied' | 'approved' | 'declined' | 'onboarded' | 'completed' | 'pending'

// Interface for updating school status
export interface UpdateSchoolStatusRequest {
  status: SchoolStatus
  reviewNotes?: string
}

// Interface for the API response
export interface UpdateSchoolStatusResponse {
  success: boolean
  message?: string
  data?: Record<string, unknown>
}



export interface Application {
  _id: string;
  school: {
    _id: string;
    schoolName: string;
    address: string;
    principal: string;
    email: string;
    students: Student[];
    status: string;
    isFirstLogin: boolean;
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  schoolName: string;
  address: string;
  schoolCode: string;
  principal: string;
  email: string;
  phone: number;
  numberOfStudents: number;
  applicationStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  reviewNotes?: string;
  reviewedAt?: string;
}


/**
 * Updates the status of a school application
 * @param id - The school ID
 * @param statusData - Object containing status and optional review notes
 * @returns Promise with the API response
 */
export async function updateSchoolStatus(
  id: string | number,
  statusData: UpdateSchoolStatusRequest
): Promise<UpdateSchoolStatusResponse> {
  console.log('🔄 updateSchoolStatus called with:', { id, statusData })
  
  try {
    const response = await fetch(`${BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(statusData),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API Success response data:', data)
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error updating school status:', error)
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update school status',
    }
  }
}

/**
 * Fetches schools data from the API
 * Supports pagination and optional filters
 * @param params Optional query params { page, limit, search, status }
 * @returns Promise with schools data
 */
export async function fetchSchools(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  try {
    const url = new URL(`${BASE_URL}/schools`)
    if (params?.page) url.searchParams.set('page', String(params.page))
    if (params?.limit) url.searchParams.set('limit', String(params.limit))
    if (params?.search) url.searchParams.set('search', params.search)
    if (params?.status) url.searchParams.set('status', params.status)

    const response = await fetch(url.toString(), {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching schools:', error)
    throw error
  }
}


// get all applications


export async function fetchApplications(
  applicationStatus?: string,
  searchTerm?: string,
  page: number = 1,
  limit: number = 20
): Promise<Application[]> {
  const response = await fetch(`${BASE_URL}/applications`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.status}`);
  }

  let apps: Application[] = await response.json();

  if (applicationStatus) {
    apps = apps.filter((app) => app.applicationStatus === applicationStatus);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    apps = apps.filter(
      (app) =>
        app.schoolName.toLowerCase().includes(term) ||
        app.address.toLowerCase().includes(term) ||
        app.principal.toLowerCase().includes(term)
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return apps.slice(startIndex, endIndex);
}
