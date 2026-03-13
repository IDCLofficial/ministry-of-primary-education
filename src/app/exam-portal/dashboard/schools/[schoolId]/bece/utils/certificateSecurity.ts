import QRCode from 'qrcode'
import type { BECECertificateData } from './certificateGenerator'

/** Payload encoded in the QR code and used for verification. */
export interface CertificateVerifyPayload {
    name: string
    examNo: string
    serial: string
    year: string | number
    /** Issue date (ISO or formatted); included in integrity check */
    issueDate?: string
    sig?: string
}

/** Build the payload object that gets signed and encoded in the QR (no sig yet). */
export function buildVerifyPayload(data: BECECertificateData): Omit<CertificateVerifyPayload, 'sig'> {
    return {
        name: data.name ?? '',
        examNo: data.examNumber ?? '',
        serial: (data.serialNumber ?? data.examNumber ?? '').trim() || '',
        year: data.year ?? '',
        issueDate: (data.issueDate ?? new Date().toISOString().slice(0, 10)).toString(),
    }
}

/** Call the server to sign the payload. Returns signature or empty string on failure. */
export async function signPayloadClient(payload: Omit<CertificateVerifyPayload, 'sig'>): Promise<string> {
    try {
        const base = typeof window !== 'undefined' ? window.location.origin : ''
        const res = await fetch(`${base}/api/certificate/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!res.ok) return ''
        const json = await res.json()
        return typeof json.sig === 'string' ? json.sig : ''
    } catch {
        return ''
    }
}

/** Verify a payload's signature via the server. */
export async function verifyPayloadClient(payload: Omit<CertificateVerifyPayload, 'sig'>, sig: string): Promise<boolean> {
    try {
        const base = typeof window !== 'undefined' ? window.location.origin : ''
        const res = await fetch(`${base}/api/certificate/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload, sig }),
        })
        if (!res.ok) return false
        const json = await res.json()
        return json.valid === true
    } catch {
        return false
    }
}

/** Build the verify URL for a given path (e.g. student-portal/bece/verify or student-portal/ubeat/verify). */
export function buildVerifyUrlFor(
    verifyPath: string,
    payload: CertificateVerifyPayload,
    baseUrl?: string
): string {
    const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')
    const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    return `${base}/${verifyPath}?data=${encodeURIComponent(data)}`
}

/** Build the verify URL that the QR code will point to (reconstructs exam login with autofill). */
export function buildVerifyUrl(payload: CertificateVerifyPayload, baseUrl?: string): string {
    return buildVerifyUrlFor('student-portal/bece/verify', payload, baseUrl)
}

/** Generate a QR code as a data URL for the verify URL (perfect square, high quality). */
export async function generateCertificateQR(
    data: BECECertificateData,
    options?: { size?: number; margin?: number; baseUrl?: string }
): Promise<string> {
    const payload = buildVerifyPayload(data)
    const sig = await signPayloadClient(payload)
    const fullPayload: CertificateVerifyPayload = { ...payload, sig }
    const verifyUrl = buildVerifyUrl(fullPayload, options?.baseUrl)
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

/** Load an image from a data URL (e.g. QR code). */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image from data URL'))
        img.src = dataUrl
    })
}

/** Embed a short ID in the canvas using LSB of blue channel (steganographic watermark). */
export function embedSteganographicId(
    ctx: CanvasRenderingContext2D,
    id: string,
    cw: number,
    ch: number
): void {
    const imageData = ctx.getImageData(0, 0, cw, ch)
    const bits = id.split('').flatMap((c) =>
        c.charCodeAt(0).toString(2).padStart(8, '0').split('').map(Number)
    )
    const maxPixels = (imageData.data.length / 4) | 0
    const len = Math.min(bits.length, maxPixels)
    for (let i = 0; i < len; i++) {
        const idx = i * 4 + 2
        imageData.data[idx] = (imageData.data[idx] & 0xfe) | bits[i]
    }
    ctx.putImageData(imageData, 0, 0)
}

/** Decode verify payload from the ?data= query param (base64 JSON). */
export function generateVerifyPayloadFromQuery(dataParam: string): CertificateVerifyPayload | null {
    try {
        const decoded = decodeURIComponent(dataParam)
        const json = decodeURIComponent(escape(atob(decoded)))
        const parsed = JSON.parse(json) as CertificateVerifyPayload
        if (typeof parsed.name !== 'string' || typeof parsed.examNo !== 'string') return null
        return parsed
    } catch {
        return null
    }
}

/** Decode the steganographic ID from image data (for verification tools). */
export function decodeSteganographicId(imageData: ImageData, maxBytes: number = 64): string {
    const bytes: number[] = []
    const maxPixels = Math.min((imageData.data.length / 4) | 0, maxBytes * 8)
    for (let i = 0; i < maxPixels; i += 8) {
        let byte = 0
        for (let b = 0; b < 8 && i + b < maxPixels; b++) {
            const idx = (i + b) * 4 + 2
            byte |= (imageData.data[idx] & 1) << (7 - b)
        }
        if (byte === 0) break
        bytes.push(byte)
    }
    return String.fromCharCode(...bytes)
}
