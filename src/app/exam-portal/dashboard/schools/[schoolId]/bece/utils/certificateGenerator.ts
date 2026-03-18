import { capitalize, capitalizeWords } from '@/lib'
import { Student, Subject } from '../../../types/student.types'
import { toWordBracket, toYearPhrase, toYearWord } from '@/lib/numberToWords'
import {
    generateCertificateQR,
    loadImageFromDataUrl,
    embedSteganographicId,
} from './certificateSecurity'

export interface BECECertificateData {
    /** Student name (displayed after "This is to certify that") */
    name: string
    /** School name (used with LGA in the combined LGA line) */
    schoolName: string
    /** LGA (Local Government Area); displayed with school name on cert */
    lga?: string
    /** Exam year (e.g. 2025) */
    year?: number | string
    /** Number of subjects (e.g. "9") - displayed in "following _____ subjects" */
    subjectCount: number
    /** Courses to show in the two vertical tables: [{ subject, grade }, ...] */
    courses: Array<{ subject: string; grade: string }>
    /** Exam number (e.g. IMS/JSC/...) */
    examNumber?: string
    /** Certificate / serial number (fallback to examNumber when missing) */
    serialNumber?: string
    /** Issue date (e.g. ISO "2025-03-12" or formatted); included in integrity check */
    issueDate?: string
}

/** Normalize grade for display (never show undefined). */
function normalizeGrade(grade: unknown): string {
    if (grade == null || grade === '') return '—'
    const s = String(grade).trim()
    return s || '—'
}

/** BECE grade from numeric score (same scale as student portal). */
function gradeFromScore(score: number): string {
    if (score >= 80) return 'A1'
    if (score >= 70) return 'B2'
    if (score >= 65) return 'B3'
    if (score >= 60) return 'C4'
    if (score >= 55) return 'C5'
    if (score >= 50) return 'C6'
    if (score >= 45) return 'D7'
    if (score >= 40) return 'E8'
    return 'F9'
}

/** Build certificate data from a BECE Student. */
export function studentToBECECertificateData(student: Student): BECECertificateData {
    const courses = student.subjects.map((s: Subject) => {
        const rawGrade = (s as { grade?: unknown }).grade
        const grade = normalizeGrade(rawGrade)
        const useGrade = grade !== '—' ? grade : gradeFromScore(typeof s.exam === 'number' ? s.exam : 0)
        return {
            subject: (s.name != null && String(s.name).trim() !== '') ? String(s.name).trim() : '—',
            grade: useGrade
        }
    })
    const raw = student as { lga?: string | { name?: string }; serialNumber?: string }
    const lgaVal = raw.lga != null
        ? (typeof raw.lga === 'string' ? raw.lga : raw.lga?.name ?? '')
        : undefined
    const year = (student as { examYear?: number }).examYear ?? new Date().getFullYear()
    const serial =
        raw.serialNumber != null && String(raw.serialNumber).trim() !== ''
            ? String(raw.serialNumber).trim()
            : (student.examNo ? `${year}-${student.examNo.replace(/\//g, '-')}` : undefined)
    const issueDate = new Date().toISOString().slice(0, 10)
    return {
        name: student.name,
        schoolName: student.schoolName ?? student.school ?? '',
        lga: lgaVal || undefined,
        year,
        subjectCount: student.subjects.length,
        courses,
        examNumber: student.examNo,
        serialNumber: serial,
        issueDate,
    }
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
    url: string
    x: number
    y: number
    width: number
    height: number
    rotation?: number
    opacity?: number
}

/** Configuration for the two subject/grade tables (position and sizing). */
export interface TablesConfig {
    /** Left table: top-left X (0–1 = fraction of width) */
    leftX: number
    /** Right table: top-left X (0–1). If tableGapFraction is set, rightX is computed as leftX + tableWidthFraction + tableGapFraction. */
    rightX: number
    /** Gap between the two tables as fraction of canvas width (0–1). When set, right table starts at leftX + tableWidthFraction + tableGapFraction. */
    tableGapFraction?: number
    /** Top Y for both tables (0–1) */
    topY: number
    /** Width of each table as fraction of canvas width (0–1) */
    tableWidthFraction: number
    /** Row height (0–1 fraction of canvas height) */
    rowHeight: number
    /** Column widths: subject and grade as fraction of table width (sum = 1, or with SN column all three sum = 1) */
    subjectColFraction: number
    gradeColFraction: number
    /** Rotation of the entire table in degrees (applied to both left and right tables). */
    rotation?: number
    /** Show SN (serial number) column as first column (1, 2, 3, …). */
    showSn?: boolean
    /** Width of SN column as fraction of table width when showSn is true (subjectColFraction + gradeColFraction + snColFraction should sum to 1). */
    snColFraction?: number
    /** Font size for table header */
    headerFontSize: number
    /** Font size for table cells */
    cellFontSize: number
    /** Max number of rows per table (extra courses truncated) */
    maxRowsPerTable?: number
}

export interface BECECertificateFieldsConfig {
    studentName?: Partial<FieldConfig>
    year?: Partial<FieldConfig>
    lga?: Partial<FieldConfig>
    subjectCount?: Partial<FieldConfig>
    examNumber?: Partial<FieldConfig>
    serialNumber?: Partial<FieldConfig>
    issueDate?: Partial<FieldConfig>
    signature1?: Partial<SignatureConfig>
    signature2?: Partial<SignatureConfig>
    tables?: Partial<TablesConfig>
}

// ─── Default field positions (percentages 0–1; fonts ×3) ───

const DEFAULT_STUDENT_NAME: FieldConfig = {
    x: 0.5,
    y: 0.39,
    fontSize: 84,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'center',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

/** Year field: uses same config as the old schoolName position (school name is now welded with LGA). */
const DEFAULT_YEAR: FieldConfig = {
    x: 0.64,
    y: 0.475,
    fontSize: 54,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'center',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

const DEFAULT_LGA: FieldConfig = {
    x: 0.5,
    y: 0.433,
    fontSize: 66,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'center',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

const DEFAULT_SUBJECT_COUNT: FieldConfig = {
    x: 0.65,
    y: 0.516,
    fontSize: 60,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'center',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

const DEFAULT_EXAM_NUMBER: FieldConfig = {
    x: 0.72,
    y: 0.184,
    fontSize: 54,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'left',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

const DEFAULT_SERIAL_NUMBER: FieldConfig = {
    x: 0.885,
    y: 0.219,
    fontSize: 48,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'right',
    color: '#000000',
    transform: 'none',
    rotation: 0.1
}

const DEFAULT_ISSUE_DATE: FieldConfig = {
    x: 0.45,
    y: 0.99,
    fontSize: 42,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Times New Roman',
    align: 'left',
    color: '#000000',
    transform: 'none',
    rotation: 0
}

const DEFAULT_SIGNATURES = {
    signature1: {
        url: '/images/FSLC/signature-ed.png',
        x: 0.28,
        y: 0.82,
        width: 0.14,
        height: 0.055,
        rotation: 0,
        opacity: 1
    } as SignatureConfig,
    signature3: {
        url: '/images/FSLC/edc-signature-2024.png',
        x: 0.28,
        y: 0.82,
        width: 0.14,
        height: 0.055,
        rotation: 0,
        opacity: 1
    } as SignatureConfig,
    signature2: {
        url: '/images/FSLC/signature.png',
        x: 0.70,
        y: 0.82,
        width: 0.14,
        height: 0.055,
        rotation: 0,
        opacity: 1
    } as SignatureConfig
}

const DEFAULT_TABLES: TablesConfig = {
    leftX: 0.12,
    rightX: 0.518,
    tableGapFraction: 0.07,
    topY: 0.588,
    tableWidthFraction: 0.36,
    rowHeight: 0.032,
    subjectColFraction: 0.63,
    gradeColFraction: 0.27,
    rotation: -0.2,
    showSn: true,
    snColFraction: 0.06,
    headerFontSize: 42,
    cellFontSize: 42,
    maxRowsPerTable: 10
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const mergeField = <T>(def: T, custom?: Partial<T>): T => ({ ...def, ...custom })

const applyTransform = (text: string, t?: string): string => {
    switch (t) {
        case 'uppercase': return text.toUpperCase()
        case 'lowercase': return text.toLowerCase()
        case 'capitalize': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        default: return text
    }
}

const toPx = (value: number, dimension: number): number =>
    value <= 1 ? value * dimension : value

const deg2rad = (deg: number) => deg * (Math.PI / 180)

const setFont = (ctx: CanvasRenderingContext2D, config: FieldConfig): void => {
    const w = config.fontWeight ?? 'normal'
    const s = config.fontStyle ?? 'normal'
    const size = config.fontSize
    const family = config.fontFamily ?? 'Times New Roman'
    ctx.font = `${s} ${w} ${size}px "${family}", serif`
    ctx.textBaseline = 'alphabetic'
}

const drawRotatedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    rotation: number = 0
): void => {
    ctx.save()
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(deg2rad(rotation))
    ctx.fillText(text, 0, 0)
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

const drawSignature = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    config: SignatureConfig,
    cw: number,
    ch: number
): void => {
    const x = toPx(config.x, cw)
    const y = toPx(config.y, ch)
    const w = toPx(config.width, cw)
    const h = toPx(config.height, ch)
    const rot = config.rotation ?? 0
    const opacity = config.opacity ?? 1
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.translate(x, y)
    ctx.rotate(deg2rad(rot))
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
}

/** Split courses into left and right columns for the two vertical tables. */
function splitCourses(
    courses: Array<{ subject: string; grade: string }>,
    maxPerTable: number
): { left: Array<{ subject: string; grade: string }>; right: Array<{ subject: string; grade: string }> } {
    const n = Math.min(courses.length, maxPerTable * 2)
    const half = Math.ceil(n / 2)
    return {
        left: courses.slice(0, half),
        right: courses.slice(half, n)
    }
}

const drawTable = (
    ctx: CanvasRenderingContext2D,
    rows: Array<{ subject: string; grade: string }>,
    config: TablesConfig,
    useLeft: boolean,
    startSnIndex: number,
    cw: number,
    ch: number
): void => {
    const cellFont = `${config.cellFontSize}px "Times New Roman", serif`
    const rowPx = toPx(config.rowHeight, ch)
    const tableWidthPx = cw * (config.tableWidthFraction ?? 0.36)
    const showSn = config.showSn === true
    const snFrac = config.snColFraction ?? 0.1
    const snW = showSn ? tableWidthPx * snFrac : 0
    const subW = tableWidthPx * config.subjectColFraction
    const gradeW = tableWidthPx * config.gradeColFraction

    const leftStart = toPx(config.leftX, cw)
    const rightStart = config.tableGapFraction != null
        ? toPx(config.leftX + config.tableWidthFraction + config.tableGapFraction, cw)
        : toPx(config.rightX, cw)
    const startX = useLeft ? leftStart : rightStart
    const startY = toPx(config.topY, ch)
    const rot = config.rotation ?? 0

    ctx.save()
    ctx.fillStyle = '#000000'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.font = cellFont
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    if (rot !== 0) {
        ctx.translate(startX, startY)
        ctx.rotate(deg2rad(rot))
        ctx.translate(-startX, -startY)
    }

    let y = startY
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const subjectText = row.subject != null && String(row.subject).trim() !== '' ? String(row.subject).trim() : '—'
        const gradeText = row.grade != null && String(row.grade).trim() !== '' ? String(row.grade).trim() : '—'
        const lineY = y + config.cellFontSize * 0.8
        if (showSn) {
            ctx.fillText(String(startSnIndex + i), startX, lineY)
            ctx.fillText(subjectText, startX + snW, lineY)
            ctx.fillText(gradeText, startX + snW + subW, lineY)
        } else {
            ctx.fillText(subjectText, startX, lineY)
            ctx.fillText(gradeText, startX + subW, lineY)
        }
        y += rowPx
    }

    ctx.restore()
}

// ─── Main generator ─────────────────────────────────────────────────────────

const DEFAULT_BG_IMAGE = '/images/BECE/junior-school-certificate.jpg'

export async function generateBECECertificate(
    data: BECECertificateData,
    options?: {
        /** Background certificate image URL. Default: /images/BECE/junior-school-certificate.jpg */
        backgroundImageUrl?: string
        /** Override field/signature/table positions */
        customFields?: BECECertificateFieldsConfig
        /** Optional filename for download (default includes name) */
        filename?: string
    }
): Promise<void> {
    const bgUrl = options?.backgroundImageUrl ?? DEFAULT_BG_IMAGE
    const custom = options?.customFields ?? {}
    const subjectCountText = String(data.subjectCount)

    const studentName = mergeField(DEFAULT_STUDENT_NAME, custom.studentName)
    const year = mergeField(DEFAULT_YEAR, custom.year)
    const lga = mergeField(DEFAULT_LGA, custom.lga)
    const subjectCount = mergeField(DEFAULT_SUBJECT_COUNT, custom.subjectCount)
    const examNumber = mergeField(DEFAULT_EXAM_NUMBER, custom.examNumber)
    const serialNumber = mergeField(DEFAULT_SERIAL_NUMBER, custom.serialNumber)
    const issueDateConfig = mergeField(DEFAULT_ISSUE_DATE, custom.issueDate)
    const tables = mergeField(DEFAULT_TABLES, custom.tables)
    // SN column is only on the certificate table (always show for BECE cert)
    const tablesWithSn = { ...tables, showSn: true } as typeof tables
    const maxPerTable = tablesWithSn.maxRowsPerTable ?? 10
    const { left: leftRows, right: rightRows } = splitCourses(data.courses, maxPerTable)

    const sig1 = data.year === 2024 ? mergeField(DEFAULT_SIGNATURES.signature3, custom.signature2) : mergeField(DEFAULT_SIGNATURES.signature1, custom.signature1)
    const sig2 = mergeField(DEFAULT_SIGNATURES.signature2, custom.signature2)

    let sig1Img: HTMLImageElement | null = null
    let sig2Img: HTMLImageElement | null = null
    try { sig1Img = await loadImage(sig1.url) } catch { /* optional */ }
    try { sig2Img = await loadImage(sig2.url) } catch { /* optional */ }

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
            } catch {
                throw new Error('Failed to generate Certificate.');
            }

            // ── Name ──
            setFont(ctx, studentName)
            ctx.textAlign = (studentName.align ?? 'center') as CanvasTextAlign
            ctx.fillStyle = studentName.color ?? '#000000'
            drawRotatedText(
                ctx,
                applyTransform(data.name, studentName.transform),
                toPx(studentName.x, cw),
                toPx(studentName.y, ch),
                studentName.rotation ?? 0
            )

            // ── Year (schoolName config applied to year; school name is welded with LGA below) ──
            if (data.year != null && data.year !== '') {
                const yearText = toYearPhrase(Number(data.year ?? 0), "in the year")
                setFont(ctx, year)
                ctx.textAlign = (year.align ?? 'center') as CanvasTextAlign
                ctx.fillStyle = year.color ?? '#000000'
                drawRotatedText(
                    ctx,
                    applyTransform(yearText, year.transform),
                    toPx(year.x, cw),
                    toPx(year.y, ch),
                    year.rotation ?? 0
                )
            }

            // ── LGA (school name + LGA combined) ──
            if (data.lga != null && data.lga !== '') {
                setFont(ctx, lga)
                ctx.textAlign = (lga.align ?? 'center') as CanvasTextAlign
                ctx.fillStyle = lga.color ?? '#000000'
                drawRotatedText(
                    ctx,
                    applyTransform(`${capitalizeWords(data.schoolName ?? '')}, ${capitalizeWords(data.lga ?? '')}`, lga.transform),
                    toPx(lga.x, cw),
                    toPx(lga.y, ch),
                    lga.rotation ?? 0
                )
            }

            // ── Subject count (e.g. in "following _____ subjects") ──
            setFont(ctx, subjectCount)
            ctx.textAlign = (subjectCount.align ?? 'center') as CanvasTextAlign
            ctx.fillStyle = subjectCount.color ?? '#000000'
            drawRotatedText(
                ctx,
                applyTransform(capitalize(toWordBracket(Number(subjectCountText))), subjectCount.transform),
                toPx(subjectCount.x, cw),
                toPx(subjectCount.y, ch),
                subjectCount.rotation ?? 0
            )

            // ── Exam number ──
            if (data.examNumber != null && data.examNumber !== '') {
                setFont(ctx, examNumber)
                ctx.textAlign = (examNumber.align ?? 'left') as CanvasTextAlign
                ctx.fillStyle = examNumber.color ?? '#000000'
                drawRotatedText(
                    ctx,
                    applyTransform(data.examNumber, examNumber.transform),
                    toPx(examNumber.x, cw),
                    toPx(examNumber.y, ch),
                    examNumber.rotation ?? 0
                )
            }

            // ── Cert / serial number (fallback to exam number when serial missing) ──
            const serialDisplay = (data.serialNumber ?? data.examNumber ?? '').trim()
            if (serialDisplay) {
                setFont(ctx, serialNumber)
                ctx.textAlign = (serialNumber.align ?? 'right') as CanvasTextAlign
                ctx.fillStyle = serialNumber.color ?? '#000000'
                drawRotatedText(
                    ctx,
                    applyTransform(serialDisplay, serialNumber.transform),
                    toPx(serialNumber.x, cw),
                    toPx(serialNumber.y, ch),
                    serialNumber.rotation ?? 0
                )
            }

            // ── Issue date ──
            if (data.issueDate != null && data.issueDate !== '') {
                const issueStr = typeof data.issueDate === 'string' ? data.issueDate : new Date().toISOString().slice(0, 10)
                setFont(ctx, issueDateConfig)
                ctx.textAlign = (issueDateConfig.align ?? 'left') as CanvasTextAlign
                ctx.fillStyle = issueDateConfig.color ?? '#000000'
                drawRotatedText(
                    ctx,
                    applyTransform(issueStr, issueDateConfig.transform),
                    toPx(issueDateConfig.x, cw),
                    toPx(issueDateConfig.y, ch),
                    issueDateConfig.rotation ?? 0
                )
            }

            // ── Two vertical tables (SN column only on certificate) ──
            drawTable(ctx, leftRows, tablesWithSn, true, 1, cw, ch)
            drawTable(ctx, rightRows, tablesWithSn, false, leftRows.length + 1, cw, ch)

            // ── Signatures ──
            if (sig1Img) drawSignature(ctx, sig1Img, sig1, cw, ch)
            if (sig2Img) drawSignature(ctx, sig2Img, sig2, cw, ch)

            // ── QR code (perfect square, verify URL + HMAC-signed payload for document integrity) ──
            if (qrImg) {
                const qrFraction = 0.14
                const qrSizePx = Math.min(toPx(qrFraction, cw), toPx(qrFraction, ch))
                const qrX = toPx(0.853, cw)
                const qrY = toPx(0.87, ch)
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(qrImg, qrX, qrY, qrSizePx, qrSizePx)
            }

            // ── Invisible steganographic watermark (survives screenshots) ──
            const stegoId = (data.serialNumber ?? data.examNumber ?? data.name ?? '').slice(0, 32)
            if (stegoId) embedSteganographicId(ctx, stegoId, cw, ch)

            // ── Export ──
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'))
                    return
                }
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                const safeName = (data.name || 'Certificate').replace(/[/\\?*]/g, '_')
                link.href = url
                link.download = options?.filename ?? `BECE_Certificate_${safeName}.png`
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
