export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const endpointsPaths = {
    LOGIN: '/admin/login',
    PROFILE: '/admin/profile',
    UPDATE_PASSWORD: '/admin/changePassword',   
}

export const endpoints = {
    LOGIN: `${API_BASE_URL}${endpointsPaths.LOGIN}`,
    PROFILE: `${API_BASE_URL}${endpointsPaths.PROFILE}`,
    UPDATE_PASSWORD: `${API_BASE_URL}${endpointsPaths.UPDATE_PASSWORD}`,
}