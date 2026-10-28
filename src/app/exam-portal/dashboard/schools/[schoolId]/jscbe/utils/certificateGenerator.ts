import { Student } from '../../../types/student.types'
import {
    generateCertificateQR,
    loadImageFromDataUrl,
    embedSteganographicId,
} from './certificateSecurity'
import { COMMISSIONERS_SIGNATURES, DIRECTORS_SIGNATURES } from '../../../constants'

// The JS(B/T)CE certificate (unlike BECE's) carries no per-subject grade
// table — it's a single "passed with {Pass|Credit|Distinction}" cert, same
// shape as UBEAT's. The grade word, color scheme, and "ED (IS) 1A/1B/1C"
// reference are baked into three separate background images (see
// public/images/JSBTCE/) rather than drawn — we only pick which background.
export type JSCBECertificateType = 'pass' | 'credit' | 'distinction'

export interface JSCBECertificateData {
    /** Student name (displayed after "This is to certify that") */
    name: string
    /** School name (displayed after "of") */
    schoolName: string
    /** Exam year (e.g. 2025) */
    year?: number | string
    /** Exam number (printed near "P No./C No./D No.") */
    examNumber?: string
    /** Certificate / serial number (fallback to examNumber when missing) */
    serialNumber?: string
    /** Issue date (ISO "2025-03-12" or similar); included in the QR integrity check */
    issueDate?: string
    /** Free-text overall grade from the student record (e.g. "Distinction", "Credit", "Pass", or a letter grade) */
    overallGrade?: string
}

/** Build certificate data from a JS(B/T)CE Student. */
export function studentToJSCBECertificateData(student: Student): JSCBECertificateData {
    const raw = student as { serialNumber?: string }
    const year = (student as { examYear?: number }).examYear ?? new Date().getFullYear()
    const serial =
        raw.serialNumber != null && String(raw.serialNumber).trim() !== ''
            ? String(raw.serialNumber).trim()
            : (student.examNo ? `${year}-${student.examNo.replace(/\//g, '-')}` : undefined)
    return {
        name: student.name,
        schoolName: student.schoolName ?? student.school ?? '',
        year,
        examNumber: student.examNo,
        serialNumber: serial,
        issueDate: new Date().toISOString().slice(0, 10),
        overallGrade: student.overallGrade,
    }
}

/** Normalize a free-text overall grade into one of the 3 certificate tiers. */
export function normalizeJSCBEGradeTier(overallGrade: string | undefined): JSCBECertificateType {
    const g = (overallGrade ?? '').trim().toLowerCase()
    if (g.includes('distinction') || g === 'a' || g === 'a1') return 'distinction'
    if (g.includes('credit') || /^[ab]/.test(g)) return 'credit'
    return 'pass'
}

// ─── Field config ───────────────────────────────────────────────────────────

export interface FieldConfig {
    x: number
    y: number
    fontSize: number
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    fontFamily?: string
    align?: 'left' | 'center' | 'right'
    color?: string
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
    rotation?: number
}

export interface SignatureConfig {
    x: number
    y: number
    width: number
    height: number
    rotation?: number
    opacity?: number
}

export interface JSCBECertificateFieldsConfig {
    studentName?: Partial<FieldConfig>
    schoolName?: Partial<FieldConfig>
    examNumber?: Partial<FieldConfig>
    year?: Partial<FieldConfig>
    issueDate?: Partial<FieldConfig>
    issueDateYear?: Partial<FieldConfig>
    signature1?: Partial<SignatureConfig>
    signature2?: Partial<SignatureConfig>
}

// ─── Default field positions ─────────────────────────────────────────────
// All three grade tiers (Pass/Credit/Distinction) share the exact same
// layout — only the color and baked-in grade word differ between the three
// background images — so one config works for all of them, unlike UBEAT
// which needed a separate config per tier.
//
// These were measured by eye against the supplied artwork
// (public/images/JSBTCE/*.png, 2482×3508). Close, but worth a visual check
// against a real generated sample before trusting it for production certs.

const STUDENT_NAME: FieldConfig = {
    x: 0.5, y: 0.44, fontSize: 60,
    fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'center', color: '#000000', transform: 'capitalize', rotation: 0,
}

const SCHOOL_NAME: FieldConfig = {
    x: 0.5, y: 0.497, fontSize: 48,
    fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'center', color: '#000000', transform: 'uppercase', rotation: 0,
}

/** Exam number, printed next to the "P No./C No./D No." label top-right. */
const EXAM_NUMBER: FieldConfig = {
    x: 0.80, y: 0.126, fontSize: 46,
    fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'left', color: '#000000', transform: 'none', rotation: 0,
}

/** 2-digit exam year, filling the "20........ WITH" blank. */
const YEAR: FieldConfig = {
    x: 0.50, y: 0.584, fontSize: 56,
    fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'center', color: '#000000', transform: 'none', rotation: 0,
}

/** Day+month, filling the "Date:........" blank at the bottom. */
const ISSUE_DATE: FieldConfig = {
    x: 0.18, y: 0.896, fontSize: 40,
    fontWeight: 'normal', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'left', color: '#000000', transform: 'none', rotation: 0,
}

/** 2-digit issue year, filling the second "20......." blank at the bottom. */
const ISSUE_DATE_YEAR: FieldConfig = {
    x: 0.895, y: 0.896, fontSize: 40,
    fontWeight: 'normal', fontStyle: 'normal', fontFamily: 'Times New Roman',
    align: 'center', color: '#000000', transform: 'none', rotation: 0,
}

const SIGNATURES = {
    signature1: { x: 0.235, y: 0.745, width: 0.15, height: 0.055, rotation: 0, opacity: 1 } as SignatureConfig,
    signature2: { x: 0.775, y: 0.745, width: 0.15, height: 0.055, rotation: 0, opacity: 1 } as SignatureConfig,
}

const IMAGE_MAP: Record<JSCBECertificateType, string> = {
    pass: '/images/JSBTCE/Junior School Certificate - PASS.png',
    credit: '/images/JSBTCE/Junior School Certificate - CREDIT.png',
    distinction: '/images/JSBTCE/Junior School Certificate - DISTINCTION.png',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const mergeField = <T>(def: T, custom?: Partial<T>): T => ({ ...def, ...custom })

const applyTransform = (text: string, t?: string): string => {
    switch (t) {
        case 'uppercase': return text.toUpperCase()
        case 'lowercase': return text.toLowerCase()
        case 'capitalize': return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        default: return text
    }
}

const toPx = (value: number, dimension: number): number =>
    value <= 1 ? value * dimension : value

const deg2rad = (deg: number) => deg * (Math.PI / 180)

const setFont = (ctx: CanvasRenderingContext2D, config: FieldConfig): void => {
    const w = config.fontWeight ?? 'normal'
    const s = config.fontStyle ?? 'normal'
    ctx.font = `${s} ${w} ${config.fontSize}px "${config.fontFamily ?? 'Times New Roman'}", serif`
    ctx.textBaseline = 'alphabetic'
}

const drawField = (ctx: CanvasRenderingContext2D, text: string, config: FieldConfig, cw: number, ch: number): void => {
    setFont(ctx, config)
    ctx.textAlign = (config.align ?? 'center') as CanvasTextAlign
    ctx.fillStyle = config.color ?? '#000000'
    const x = toPx(config.x, cw)
    const y = toPx(config.y, ch)
    ctx.save()
    ctx.translate(x, y)
    if (config.rotation) ctx.rotate(deg2rad(config.rotation))
    ctx.fillText(applyTransform(text, config.transform), 0, 0)
    ctx.restore()
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
    })

const drawSignature = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, config: SignatureConfig, cw: number, ch: number): void => {
    const x = toPx(config.x, cw)
    const y = toPx(config.y, ch)
    const w = toPx(config.width, cw)
    const h = toPx(config.height, ch)
    ctx.save()
    ctx.globalAlpha = config.opacity ?? 1
    ctx.translate(x, y)
    if (config.rotation) ctx.rotate(deg2rad(config.rotation))
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
}

// ─── Main generator ─────────────────────────────────────────────────────────

export async function generateJSCBECertificate(
    data: JSCBECertificateData,
    options?: {
        /** 'pass' | 'credit' | 'distinction' — defaults to deriving it from data.overallGrade */
        certificateType?: JSCBECertificateType
        /** Override field/signature positions */
        customFields?: JSCBECertificateFieldsConfig
        /** Optional filename for download */
        filename?: string
        /** Return the PNG as a Blob instead of triggering a download (e.g. for previews/testing) */
        returnBlob?: boolean
    }
): Promise<void | Blob> {
    const certificateType = options?.certificateType ?? normalizeJSCBEGradeTier(data.overallGrade)
    const bgUrl = IMAGE_MAP[certificateType]
    const custom = options?.customFields ?? {}

    const studentName = mergeField(STUDENT_NAME, custom.studentName)
    const schoolName = mergeField(SCHOOL_NAME, custom.schoolName)
    const examNumber = mergeField(EXAM_NUMBER, custom.examNumber)
    const year = mergeField(YEAR, custom.year)
    const issueDate = mergeField(ISSUE_DATE, custom.issueDate)
    const issueDateYear = mergeField(ISSUE_DATE_YEAR, custom.issueDateYear)
    const sig1 = mergeField(SIGNATURES.signature1, custom.signature1)
    const sig2 = mergeField(SIGNATURES.signature2, custom.signature2)

    const examYear = Number(data.year) || new Date().getFullYear()

    let sig1Img: HTMLImageElement | null = null
    let sig2Img: HTMLImageElement | null = null
    try {
        const cfg = DIRECTORS_SIGNATURES[examYear]
        if (cfg?.path) sig1Img = await loadImage(cfg.path)
    } catch (error) {
        console.warn('Could not load signature 1:', error)
    }
    try {
        const cfg = COMMISSIONERS_SIGNATURES[examYear]
        if (cfg?.path) sig2Img = await loadImage(cfg.path)
    } catch (error) {
        console.warn('Could not load signature 2:', error)
    }

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = async () => {
            canvas.width = img.width
            canvas.height = img.height
            const cw = canvas.width
            const ch = canvas.height
            ctx.drawImage(img, 0, 0)

            let qrImg: HTMLImageElement | null = null
            try {
                const qrDataUrl = await generateCertificateQR(data, { size: 280, margin: 4 })
                qrImg = await loadImageFromDataUrl(qrDataUrl)
            } catch (error) {
                console.warn('Could not generate certificate QR:', error)
            }

            drawField(ctx, data.name, studentName, cw, ch)
            if (data.schoolName) drawField(ctx, data.schoolName, schoolName, cw, ch)
            if (data.examNumber) drawField(ctx, data.examNumber, examNumber, cw, ch)
            drawField(ctx, String(examYear).slice(-2), year, cw, ch)

            const issueRaw = typeof data.issueDate === 'string' ? data.issueDate : new Date().toISOString().slice(0, 10)
            const parsed = new Date(issueRaw + 'T00:00:00')
            if (!isNaN(parsed.getTime())) {
                const dayMonth = parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
                drawField(ctx, dayMonth, issueDate, cw, ch)
                drawField(ctx, String(parsed.getFullYear()).slice(-2), issueDateYear, cw, ch)
            }

            if (sig1Img) {
                const scale = DIRECTORS_SIGNATURES[examYear]?.scale ?? 0.15
                const aspect = sig1Img.width / sig1Img.height
                const w = cw * scale
                drawSignature(ctx, sig1Img, { ...sig1, width: w, height: w / aspect }, cw, ch)
            }
            if (sig2Img) {
                const scale = COMMISSIONERS_SIGNATURES[examYear]?.scale ?? 0.15
                const aspect = sig2Img.width / sig2Img.height
                const w = cw * scale
                drawSignature(ctx, sig2Img, { ...sig2, width: w, height: w / aspect }, cw, ch)
            }

            // ── QR code (verify URL + HMAC-signed payload) ──
            if (qrImg) {
                const qrFraction = 0.10
                const qrSizePx = Math.min(toPx(qrFraction, cw), toPx(qrFraction, ch))
                const qrX = toPx(0.80, cw)
                const qrY = toPx(0.675, ch)
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(qrImg, qrX, qrY, qrSizePx, qrSizePx)
            }

            // ── Invisible steganographic watermark ──
            const stegoId = (data.serialNumber ?? data.examNumber ?? data.name ?? '').slice(0, 32)
            if (stegoId) embedSteganographicId(ctx, stegoId, cw, ch)

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'))
                    return
                }
                if (options?.returnBlob) {
                    resolve(blob)
                    return
                }
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                const safeName = (data.name || 'Certificate').replace(/[/\\?*]/g, '_')
                link.href = url
                link.download = options?.filename ?? `JSCBE_Certificate_${safeName}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                resolve()
            }, 'image/png')
        }
        img.onerror = () => reject(new Error(`Failed to load certificate image: ${bgUrl}`))
        img.src = bgUrl
    })
}
