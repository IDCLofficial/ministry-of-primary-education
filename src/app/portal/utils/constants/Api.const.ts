import { ExamTypeEnum } from "../../store/api/authApi"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const endpoints = {
    LOGOUT: '/auth/logout',
    REGISTER: '/schools/register',
    GET_SCHOOL_NAMES: '/schools/names',
    GET_SCHOOL_BY_CODE: (schoolCode: string) => `/schools/${schoolCode}`,
    GET_LGAS: '/lga/aee-registered-lga',
    SUBMIT_SCHOOL_APPLICATION: '/applications',
    LOGIN: '/auth/login',
    CREATE_PASSWORD: '/auth/createPassword',
    PROFILE: '/auth/profile',
    GET_STUDENTS_BY_SCHOOL: (examType: ExamTypeEnum, schoolId: string)=>`/students/${examType}/${schoolId}`,
    CREATE_STUDENT_PAYMENT: '/student-payments/school',
    VERIFY_PAYMENT: '/student-payments/verify',
    ONBOARD_STUDENT: '/onboarding',
    UPDATE_APPLICATION_STATUS: '/applications',
    CHANGE_PASSWORD: "/auth/change-password",
    DELETE_ACCOUNT: "/auth/account",
    FORGOT_PASSWORD: "/auth/request-password-reset",
    VERIFY_RESET_CODE: "/auth/verify-reset-code",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_RESET_TOKEN: "/auth/validate-reset-token",
} as const