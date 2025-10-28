export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const endpoints = {
    GET_SCHOOL_NAMES: '/schools/names',
    SUBMIT_SCHOOL_APPLICATION: '/applications',
    LOGIN: '/auth/login',
    CREATE_PASSWORD: '/auth/createPassword',
    PROFILE: '/auth/profile',
    GET_STUDENTS_BY_SCHOOL: '/students/school',
    CREATE_STUDENT_PAYMENT: '/student-payments/school',
    VERIFY_PAYMENT: '/student-payments/verify',
    ONBOARD_STUDENT: '/onboarding',
    UPDATE_APPLICATION_STATUS: '/applications'
} as const