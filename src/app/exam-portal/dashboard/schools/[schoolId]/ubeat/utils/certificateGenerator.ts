import { UBEATStudent } from '../../../types/student.types'
import {
    generateUBEATCertificateQR,
    loadImageFromDataUrl,
    embedSteganographicId,
} from './certificateSecurity'

export interface CertificateData {
    student: UBEATStudent
    schoolName: string
}

// Custom font configuration
export interface CustomFont {
    family: string      // Font family name (e.g., 'Handlee')
    url: string         // Path to font file (e.g., '/fonts/Handlee-Regular.ttf')
    weight?: string     // Font weight (e.g., 'normal', 'bold', '400', '700')
    style?: string      // Font style (e.g., 'normal', 'italic')
}

// Helper to load custom fonts
const loadCustomFont = async (font: CustomFont): Promise<void> => {
    const fontFace = new FontFace(
        font.family,
        `url(${font.url})`,
        {
            weight: font.weight || 'normal',
            style: font.style || 'normal'
        }
    )
    
    try {
        const loadedFont = await fontFace.load()
        document.fonts.add(loadedFont)
    } catch (error) {
        console.error(`✗ Failed to load font: ${font.family}`, error)
        throw new Error(`Failed to load font: ${font.family}`)
    }
}

// Helper to load multiple fonts
const loadCustomFonts = async (fonts: CustomFont[]): Promise<void> => {
    await Promise.all(fonts.map(font => loadCustomFont(font)))
}

// Field configuration interface
export interface FieldConfig {
    x: number          // X position as percentage (0-1) or pixels (>1)
    y: number          // Y position as percentage (0-1) or pixels (>1)
    fontSize: number   // Font size in pixels
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    fontFamily?: string
    align?: 'left' | 'center' | 'right'
    color?: string
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
    rotation?: number  // Rotation angle in degrees (default: 0)
}

// Signature image configuration interface
export interface SignatureConfig {
    url: string        // Path to signature image (e.g., '/images/FSLC/signature.png')
    x: number          // X position as percentage (0-1) or pixels (>1)
    y: number          // Y position as percentage (0-1) or pixels (>1)
    width: number      // Width as percentage (0-1) or pixels (>1)
    height: number     // Height as percentage (0-1) or pixels (>1)
    rotation?: number  // Rotation angle in degrees (default: 0)
    opacity?: number   // Opacity 0-1 (default: 1)
}

export interface CertificateFieldsConfig {
    studentName?: Partial<FieldConfig>
    schoolName?: Partial<FieldConfig>
    examNumber?: Partial<FieldConfig>
    date?: Partial<FieldConfig>
    serialNumber?: Partial<FieldConfig>
    year?: Partial<FieldConfig>
    gradeLevel?: Partial<FieldConfig>
    signature1?: Partial<SignatureConfig>
    signature2?: Partial<SignatureConfig>
    signature3?: Partial<SignatureConfig>
}

// Certificate type specific signature configurations
interface CertificateSignaturesConfig {
    signature1: SignatureConfig
    signature2: SignatureConfig
    signature3: SignatureConfig
}

const DISTINCTION_SIGNATURES: CertificateSignaturesConfig = {
    signature1: {
        url: '/images/FSLC/signature-ed.png',
        x: 0.255,
        y: 0.80,
        width: 0.15,
        height: 0.06,
        rotation: 2,
        opacity: 1
    },
    signature3: {
        url: '/images/FSLC/edc-signature-2024.png',
        x: 0.255,
        y: 0.80,
        width: 0.15,
        height: 0.06,
        rotation: 2,
        opacity: 1
    },
    signature2: {
        url: '/images/FSLC/signature.png',
        x: 0.72,
        y: 0.81,
        width: 0.15,
        height: 0.06,
        rotation: 2,
        opacity: 1
    }
}

const CREDIT_SIGNATURES: CertificateSignaturesConfig = {
    signature1: {
        url: '/images/FSLC/signature-ed.png',
        x: 0.27,
        y: 0.74,
        width: 0.15,
        height: 0.055,
        rotation: 0,
        opacity: 1
    },
    signature3: {
        url: '/images/FSLC/edc-signature-2024.png',
        x: 0.27,
        y: 0.74,
        width: 0.15,
        height: 0.055,
        rotation: 0,
        opacity: 1
    },
    signature2: {
        url: '/images/FSLC/signature.png',
        x: 0.73,
        y: 0.75,
        width: 0.15,
        height: 0.055,
        rotation: 0,
        opacity: 1
    }
}

const PASS_SIGNATURES: CertificateSignaturesConfig = {
    signature1: {
        url: '/images/FSLC/signature-ed.png',
        x: 0.25,
        y: 0.690,
        width: 0.14,
        height: 0.055,
        rotation: 4,
        opacity: 1
    },
    signature3: {
        url: '/images/FSLC/edc-signature-2024.png',
        x: 0.25,
        y: 0.690,
        width: 0.14,
        height: 0.055,
        rotation: 4,
        opacity: 1
    },
    signature2: {
        url: '/images/FSLC/signature.png',
        x: 0.71,
        y: 0.696,
        width: 0.14,
        height: 0.055,
        rotation: 4,
        opacity: 1
    }
}

// Certificate type specific field configurations
const DISTINCTION_CONFIG: Required<Record<keyof CertificateFieldsConfig, FieldConfig>> = {
    studentName: {
        x: 0.5,
        y: 0.43,
        fontSize: 120,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.2
    },
    schoolName: {
        x: 0.5,
        y: 0.492,
        fontSize: 80,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.3
    },
    examNumber: {
        x: 0.75,
        y: 0.1525,
        fontSize: 90,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    date: {
        x: 0.30,
        y: 0.73,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000000',
        transform: 'none',
        rotation: 0.2
    },
    serialNumber: {
        x: 0.76,
        y: 0.729,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'right',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    year: {
        x: 0.692,
        y: 0.564,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'right',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    gradeLevel: {
        x: 0,
        y: 0,
        fontSize: 90,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#00F',
        transform: 'uppercase',
        rotation: 0
    },
    // Placeholder entries — signatures use SignatureConfig, not FieldConfig
    // These are never used for text rendering
    signature1: { x: 0, y: 0, fontSize: 0 },
    signature2: { x: 0, y: 0, fontSize: 0 },
    signature3: { x: 0, y: 0, fontSize: 0 }
}

const CREDIT_CONFIG: Required<Record<keyof CertificateFieldsConfig, FieldConfig>> = {
    studentName: {
        x: 0.5,
        y: 0.43,
        fontSize: 120,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.2
    },
    schoolName: {
        x: 0.5,
        y: 0.492,
        fontSize: 80,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.3
    },
    examNumber: {
        x: 0.75,
        y: 0.155,
        fontSize: 90,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    date: {
        x: 0.30,
        y: 0.845,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000000',
        transform: 'none',
        rotation: 0.8
    },
    serialNumber: {
        x: 0.76,
        y: 0.847,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'right',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    year: {
        x: 0.738,
        y: 0.564,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'right',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    gradeLevel: {
        x: 0,
        y: 0,
        fontSize: 90,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#00F',
        transform: 'uppercase',
        rotation: 0
    },
    signature1: { x: 0, y: 0, fontSize: 0 },
    signature3: { x: 0, y: 0, fontSize: 0 },
    signature2: { x: 0, y: 0, fontSize: 0 }
}

const PASS_CONFIG: Required<Record<keyof CertificateFieldsConfig, FieldConfig>> = {
    studentName: {
        x: 0.5,
        y: 0.4075,
        fontSize: 120,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0
    },
    schoolName: {
        x: 0.5,
        y: 0.465,
        fontSize: 80,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0
    },
    examNumber: {
        x: 0.74,
        y: 0.1385,
        fontSize: 80,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    date: {
        x: 0.26,
        y: 0.79,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000000',
        transform: 'none',
        rotation: 0.2
    },
    serialNumber: {
        x: 0.24,
        y: 0.14,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'right',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    year: {
        x: 0.75,
        y: 0.79,
        fontSize: 100,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000',
        transform: 'none',
        rotation: 0
    },
    gradeLevel: {
        x: 0.67,
        y: 0.532,
        fontSize: 105,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000',
        transform: 'uppercase',
        rotation: 0
    },
    signature1: { x: 0, y: 0, fontSize: 0 },
    signature2: { x: 0, y: 0, fontSize: 0 },
    signature3: { x: 0, y: 0, fontSize: 0 }
}

// Helper to merge custom config with defaults
const mergeFieldConfig = (
    defaultConfig: FieldConfig,
    customConfig?: Partial<FieldConfig>
): FieldConfig => {
    return { ...defaultConfig, ...customConfig }
}

// Helper to merge signature config with defaults
const mergeSignatureConfig = (
    defaultConfig: SignatureConfig,
    customConfig?: Partial<SignatureConfig>
): SignatureConfig => {
    return { ...defaultConfig, ...customConfig }
}

// Helper to apply text transform
const applyTransform = (text: string, transform?: string): string => {
    switch (transform) {
        case 'uppercase': return text.toUpperCase()
        case 'lowercase': return text.toLowerCase()
        case 'capitalize': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        default: return text
    }
}

// Helper to calculate actual position
const calculatePosition = (value: number, dimension: number): number => {
    return value <= 1 ? value * dimension : value
}

// Helper to set font style
const setFont = (ctx: CanvasRenderingContext2D, config: FieldConfig): void => {
    const weight = config.fontWeight || 'normal'
    const style = config.fontStyle || 'normal'
    const size = config.fontSize
    const family = config.fontFamily || 'Times New Roman'
    
    ctx.font = `${style} ${weight} ${size}px "${family}", serif`
}

// Helper to convert degrees to radians
const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180)
}

// Helper to draw text with rotation
const drawRotatedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    rotation: number = 0
): void => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(degreesToRadians(rotation))
    ctx.fillText(text, 0, 0)
    ctx.restore()
}

// Helper to load an image and return an HTMLImageElement
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
    })
}

// Helper to draw a signature image onto the canvas
const drawSignature = (
    ctx: CanvasRenderingContext2D,
    sigImg: HTMLImageElement,
    config: SignatureConfig,
    canvasWidth: number,
    canvasHeight: number
): void => {
    const x = calculatePosition(config.x, canvasWidth)
    const y = calculatePosition(config.y, canvasHeight)
    const w = calculatePosition(config.width, canvasWidth)
    const h = calculatePosition(config.height, canvasHeight)
    const rotation = config.rotation ?? 0
    const opacity = config.opacity ?? 1

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.translate(x, y)
    ctx.rotate(degreesToRadians(rotation))
    // Draw centred on (x, y) so rotation pivots around the image centre
    ctx.drawImage(sigImg, -w / 2, -h / 2, w, h)
    ctx.restore()
}

export const generateUBEATCertificate = async (
    data: CertificateData,
    certificateType: 'pass' | 'credit' | 'distinction' = 'pass',
    customFields?: CertificateFieldsConfig,
    customFonts?: CustomFont[]
): Promise<void> => {
    const { student, schoolName } = data;
    
    // Load custom fonts if provided, otherwise load default Handlee font
    try {
        const fontsToLoad = customFonts || [
            {
                family: 'Handlee',
                url: '/fonts/Handlee-Regular.ttf',
                weight: 'normal',
                style: 'normal'
            }
        ]
        await loadCustomFonts(fontsToLoad)
    } catch (error) {
        console.error('Font loading failed:', error)
    }
    
    const imagePath = (type: 'pass' | 'credit' | 'distinction') => {
        switch (type) {
            case 'pass':        return '/images/FSLC/pass_level.png'
            case 'credit':      return '/images/FSLC/credit_level.png'
            case 'distinction': return '/images/FSLC/distinction_level.png'
        }
    }

    // Select base configs based on certificate type
    const baseConfig = certificateType === 'pass'
        ? PASS_CONFIG
        : certificateType === 'credit'
            ? CREDIT_CONFIG
            : DISTINCTION_CONFIG

    const baseSignatures = certificateType === 'pass'
        ? PASS_SIGNATURES
        : certificateType === 'credit'
            ? CREDIT_SIGNATURES
            : DISTINCTION_SIGNATURES

    // Merge custom field configs with certificate-type defaults
    const fields = {
        studentName:  mergeFieldConfig(baseConfig.studentName,  customFields?.studentName),
        schoolName:   mergeFieldConfig(baseConfig.schoolName,   customFields?.schoolName),
        examNumber:   mergeFieldConfig(baseConfig.examNumber,   customFields?.examNumber),
        date:         mergeFieldConfig(baseConfig.date,         customFields?.date),
        serialNumber: mergeFieldConfig(baseConfig.serialNumber, customFields?.serialNumber),
        year:         mergeFieldConfig(baseConfig.year,         customFields?.year),
        gradeLevel:   mergeFieldConfig(baseConfig.gradeLevel,   customFields?.gradeLevel)
    }

    // Merge custom signature configs with certificate-type defaults
    const signatures = {
        signature1: mergeSignatureConfig(baseSignatures.signature1, customFields?.signature1),
        signature2: student.examYear === 2024 ? mergeSignatureConfig(baseSignatures.signature3, customFields?.signature3) : mergeSignatureConfig(baseSignatures.signature2, customFields?.signature2),
    }

    // Pre-load both signature images (fail gracefully if missing)
    let sig1Img: HTMLImageElement | null = null
    let sig2Img: HTMLImageElement | null = null

    try {
        sig1Img = await loadImage(signatures.signature1.url)
    } catch (error) {
        console.warn('Could not load signature 1:', error)
    }

    try {
        sig2Img = await loadImage(signatures.signature2.url)
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
                const qrDataUrl = await generateUBEATCertificateQR(data, { size: 280, margin: 4 })
                qrImg = await loadImageFromDataUrl(qrDataUrl)
            } catch {
                // continue without QR if signing/QR fails
            }

            // ── Text fields ──────────────────────────────────────────────────

            const examYear = student.examYear ?? new Date().getFullYear()
            const serialDisplay =
                student.serialNumber != null && String(student.serialNumber).trim() !== ''
                    ? String(student.serialNumber).trim()
                    : (student.examNumber ? `${examYear}-${student.examNumber.replace(/\//g, '-')}` : '')

            // Draw Student Name
            const studentNameConfig = fields.studentName
            setFont(ctx, studentNameConfig)
            ctx.textAlign = studentNameConfig.align as CanvasTextAlign
            ctx.fillStyle = studentNameConfig.color || '#000000'
            drawRotatedText(
                ctx,
                applyTransform(student.studentName, studentNameConfig.transform),
                calculatePosition(studentNameConfig.x, cw),
                calculatePosition(studentNameConfig.y, ch),
                studentNameConfig.rotation
            )

            // Draw School Name
            const schoolNameConfig = fields.schoolName
            setFont(ctx, schoolNameConfig)
            ctx.textAlign = schoolNameConfig.align as CanvasTextAlign
            ctx.fillStyle = schoolNameConfig.color || '#000000'
            drawRotatedText(
                ctx,
                applyTransform(schoolName, schoolNameConfig.transform),
                calculatePosition(schoolNameConfig.x, cw),
                calculatePosition(schoolNameConfig.y, ch),
                schoolNameConfig.rotation
            )

            // Draw Exam Number
            if (customFields?.examNumber !== null) {
                const examNumberConfig = fields.examNumber
                setFont(ctx, examNumberConfig)
                ctx.textAlign = examNumberConfig.align as CanvasTextAlign
                ctx.fillStyle = examNumberConfig.color || '#000000'
                const examText = `${student.examNumber}`
                drawRotatedText(
                    ctx,
                    applyTransform(examText, examNumberConfig.transform),
                    calculatePosition(examNumberConfig.x, cw),
                    calculatePosition(examNumberConfig.y, ch),
                    examNumberConfig.rotation
                )
            }

            // Draw Year
            if (customFields?.year !== null) {
                const yearConfig = fields.year
                setFont(ctx, yearConfig)
                ctx.textAlign = yearConfig.align as CanvasTextAlign
                ctx.fillStyle = yearConfig.color || '#000000'
                const yearText = examYear.toString().slice(-2)
                drawRotatedText(
                    ctx,
                    applyTransform(yearText, yearConfig.transform),
                    calculatePosition(yearConfig.x, cw),
                    calculatePosition(yearConfig.y, ch),
                    yearConfig.rotation
                )
            }

            // Draw grade level year (pass type)
            if (customFields?.gradeLevel !== null && certificateType === 'pass') {
                const gradeLevelConfig = fields.gradeLevel
                setFont(ctx, gradeLevelConfig)
                ctx.textAlign = gradeLevelConfig.align as CanvasTextAlign
                ctx.fillStyle = gradeLevelConfig.color || '#000000'
                const yearText = examYear.toString().slice(-2)
                drawRotatedText(
                    ctx,
                    applyTransform(yearText, gradeLevelConfig.transform),
                    calculatePosition(gradeLevelConfig.x, cw),
                    calculatePosition(gradeLevelConfig.y, ch),
                    gradeLevelConfig.rotation
                )
            }

            // Draw Date (display; issue date for integrity is in QR payload)
            const dateConfig = fields.date
            setFont(ctx, dateConfig)
            ctx.textAlign = dateConfig.align as CanvasTextAlign
            ctx.fillStyle = dateConfig.color || '#000000'
            const dateStr = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: undefined
            }).replace(/\d{4}/, String(examYear))
            drawRotatedText(
                ctx,
                applyTransform(dateStr, dateConfig.transform),
                calculatePosition(dateConfig.x, cw),
                calculatePosition(dateConfig.y, ch),
                dateConfig.rotation
            )

            // Draw Serial Number (optional; fallback to year-examNo when serial missing)
            if (customFields?.serialNumber !== null) {
                const serialConfig = fields.serialNumber
                setFont(ctx, serialConfig)
                ctx.textAlign = serialConfig.align as CanvasTextAlign
                ctx.fillStyle = serialConfig.color || '#000000'
                const serialText = certificateType === 'pass'
                    ? (serialDisplay ? `S/N: ${serialDisplay}` : '')
                    : examYear.toString().slice(-2)
                if (serialText) {
                    drawRotatedText(
                        ctx,
                        applyTransform(serialText, serialConfig.transform),
                        calculatePosition(serialConfig.x, cw),
                        calculatePosition(serialConfig.y, ch),
                        serialConfig.rotation
                    )
                }
            }

            // ── Signature images ─────────────────────────────────────────────

            if (sig1Img && customFields?.signature1 !== null) {
                drawSignature(ctx, sig1Img, signatures.signature1, cw, ch)
            }

            if (sig2Img && customFields?.signature2 !== null) {
                drawSignature(ctx, sig2Img, signatures.signature2, cw, ch)
            }

            // ── QR code (verify URL + HMAC-signed payload) ────────────────────

            if (qrImg) {
                const qrFraction = 0.14
                const qrSizePx = Math.min(
                    calculatePosition(qrFraction, cw),
                    calculatePosition(qrFraction, ch)
                )
                const qrX = calculatePosition(0.853, cw)
                const qrY = calculatePosition(0.87, ch)
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(qrImg, qrX, qrY, qrSizePx, qrSizePx)
            }

            // ── Invisible steganographic watermark ────────────────────────────

            const stegoId = (serialDisplay || student.examNumber || student.studentName || '').slice(0, 32)
            if (stegoId) embedSteganographicId(ctx, stegoId, cw, ch)

            // ── Export ───────────────────────────────────────────────────────

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'))
                    return
                }

                const url  = URL.createObjectURL(blob)
                const link = document.createElement('a')
                const filename = `UBEAT_Certificate_${student.examNumber.replace(/\//g, '_')}.png`

                link.href     = url
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                URL.revokeObjectURL(url)
                resolve()
            }, 'image/png')
        }

        img.onerror = () => {
            reject(new Error('Failed to load certificate image'))
        }

        img.src = imagePath(certificateType)
    })
}