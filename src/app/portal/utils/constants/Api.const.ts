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
    /**
     * Bulk Downloads (agent) — list every student in a school cohort for bulk
     * payment/selection. The exam type is in the URL; pagination and cohort
     * filters live in the POST body, status filtering is a query param.
     *
     * URL:     POST /{examType}/students/by-school?paymentStatus=paid|unpaid
     * Body:    { year, lga, schoolId, page, limit }
     * Response: {
     *   data: BulkStudentListItem[],
     *   pagination: { total, page, limit, totalPages, hasNextPage, hasPreviousPage }
     * }
     */
    GET_BULK_STUDENTS_BY_SCHOOL: (examType: ExamTypeEnum) => `/${examType === "BECE"? "bece-student": examType.toLowerCase()}/students/by-school`,
    CREATE_STUDENT_PAYMENT: '/student-payments/school',
    VERIFY_PAYMENT: '/student-payments/verify',
    /**
     * Bulk Payments (agent) — initiate a single Paystack transaction that
     * covers N selected students in one go. The agent's selected `studentIds`
     * are persisted in the transaction metadata; on verification, the
     * backend marks every saved student as paid.
     *
     * URL:      POST /result-payment/create-batch?callbackUrl=<frontend-url>
     * Body:     { examType: 'UBEAT' | 'BECE', examYear: number, studentIds: string[] }
     * Response: { authorizationUrl, reference, studentCount, totalAmount }
     *
     * The `callbackUrl` query param is the URL Paystack will redirect the
     * agent to after payment. We pass `window.location.origin + bulkRoute`
     * so the agent lands back on the bulk-downloads page, which then fires
     * `verifyBatchPayment(reference)` to confirm and refresh the cohort.
     */
    CREATE_BATCH_PAYMENT: '/result-payment/create-batch',
    /**
     * Verify a batch payment by its Paystack reference. The backend reads
     * the saved `studentIds` from the transaction metadata and marks each
     * student as paid when verification succeeds.
     *
     * URL:      GET /result-payment/verify/:reference
     * Response: { statusCode, paymentStatus: 'successful' | 'failed' | 'pending', reference?, ... }
     */
    VERIFY_BATCH_PAYMENT: (reference: string) => `/result-payment/verify/${encodeURIComponent(reference)}`,
    /**
     * Voucher Receipt Lookup — fetch the full voucher record (school, exam,
     * year, paid amount, and the list of student ids it covers) by its
     * reference. The verify-batch response includes a `voucherReference`;
     * the agent pastes it here to see which students they're entitled to
     * download and to trigger the bulk download.
     *
     * URL:      GET /voucher/:voucherReference
     * Response: VoucherResponse (see studentApi.ts)
     */
    GET_VOUCHER: (voucherReference: string) => `/voucher/${encodeURIComponent(voucherReference)}`,
    /**
     * Voucher Download — fetch student exam numbers and grades for the paid
     * students on this voucher, triggering certificate generation + zipping
     * on the backend.
     *
     * URL:      GET /voucher/:voucherReference/download
     * Response: { schoolName, students: { studentName, examYear, examNo, grade }[] }
     */
    GET_VOUCHER_DOWNLOAD: (voucherReference: string) =>
        `/voucher/${encodeURIComponent(voucherReference)}/download`,
    ONBOARD_STUDENT: '/onboarding',
    UPDATE_APPLICATION_STATUS: '/applications',
    CHANGE_PASSWORD: "/auth/change-password",
    DELETE_ACCOUNT: "/auth/account",
    FORGOT_PASSWORD: "/auth/request-password-reset",
    VERIFY_RESET_CODE: "/auth/verify-reset-code",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_RESET_TOKEN: "/auth/validate-reset-token",
    LOAD_EXAMS_DATA: "/exams",
    GET_MY_PAID_SCHOOLS: "/schools/get-my-paid-schools",
} as const