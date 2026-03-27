import QRCode from 'qrcode'
import type { CertificateData } from './certificateGenerator'
import type { CertificateVerifyPayload } from '@/app/exam-portal/dashboard/schools/[schoolId]/bece/utils/certificateSecurity'
import {
    signPayloadClient,
    buildVerifyUrlFor,
    loadImageFromDataUrl,
    embedSteganographicId,
} from '@/app/exam-portal/dashboard/schools/[schoolId]/bece/utils/certificateSecurity'

export type { CertificateVerifyPayload }

/** Build the payload object for UBEAT that gets signed and encoded in the QR (no sig yet). */
export function buildUBEATVerifyPayload(data: CertificateData): Omit<CertificateVerifyPayload, 'sig'> {
    const { student, schoolName } = data
    const year = student.examYear ?? new Date().getFullYear()
    const serial =
        student.serialNumber != null && String(student.serialNumber).trim() !== ''
            ? String(student.serialNumber).trim()
            : (student.examNumber ? `${year}-${student.examNumber.replace(/\//g, '-')}` : '')
    const issueDate = new Date().toISOString().slice(0, 10)
    return {
        name: student.studentName ?? '',
        examNo: student.examNumber ?? '',
        serial: (serial || student.examNumber) ?? '',
        year: String(year),
        issueDate,
    }
}

/** Generate a QR code as a data URL for the UBEAT verify URL (perfect square, high quality). */
export async function generateUBEATCertificateQR(
    data: CertificateData,
    options?: { size?: number; margin?: number; baseUrl?: string }
): Promise<string> {
    const payload = buildUBEATVerifyPayload(data)
    const sig = await signPayloadClient(payload)
    const fullPayload: CertificateVerifyPayload = { ...payload, sig }
    const verifyUrl = buildVerifyUrlFor('result-checking/ubeat/verify', fullPayload, options?.baseUrl)
    const size = options?.size ?? 280
    const margin = options?.margin ?? 4
    return QRCode.toDataURL(verifyUrl, {
        width: size,
        margin,
        errorCorrectionLevel: 'M',
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })
}

export { loadImageFromDataUrl, embedSteganographicId }
