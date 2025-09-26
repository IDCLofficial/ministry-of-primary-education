// Base URL for the API
export const BASE_URL = 'https://11cd2e67d06a.ngrok-free.app'

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
  data?: any
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
 * @returns Promise with schools data
 */
export async function fetchSchools() {
  try {
    const response = await fetch(`${BASE_URL}/schools`, {
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
