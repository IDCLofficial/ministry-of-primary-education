import { UBEATStudent } from '../../../types/student.types'

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
        console.log(`✓ Font loaded: ${font.family}`)
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

export interface CertificateFieldsConfig {
    studentName?: Partial<FieldConfig>
    schoolName?: Partial<FieldConfig>
    examNumber?: Partial<FieldConfig>
    date?: Partial<FieldConfig>
    serialNumber?: Partial<FieldConfig>
    year?: Partial<FieldConfig>
    gradeLevel?: Partial<FieldConfig>
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
        y: 0.727,
        fontSize: 100,
        fontWeight: 'normal',
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
        fontWeight: 'normal',
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
        fontWeight: 'normal',
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
    }
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
        fontWeight: 'normal',
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
        fontWeight: 'normal',
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
        fontWeight: 'normal',
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
    }
}

const PASS_CONFIG: Required<Record<keyof CertificateFieldsConfig, FieldConfig>> = {
    studentName: {
        x: 0.5,
        y: 0.56,
        fontSize: 120,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.6
    },
    schoolName: {
        x: 0.5,
        y: 0.625,
        fontSize: 80,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#000000',
        transform: 'uppercase',
        rotation: 0.8
    },
    examNumber: {
        x: 0.18,
        y: 0.968,
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
        x: 0.20,
        y: 0.882,
        fontSize: 100,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'left',
        color: '#000000',
        transform: 'none',
        rotation: 1.4
    },
    serialNumber: {
        x: 0.82,
        y: 0.17,
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
        x: 0.5,
        y: 0.9,
        fontSize: 80,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#00F',
        transform: 'none',
        rotation: 0
    },
    gradeLevel: {
        x: 0.5,
        y: 0.75,
        fontSize: 90,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontFamily: 'Times New Roman',
        align: 'center',
        color: '#F00',
        transform: 'uppercase',
        rotation: 0
    }
}

// Helper to merge custom config with defaults
const mergeFieldConfig = (
    defaultConfig: FieldConfig,
    customConfig?: Partial<FieldConfig>
): FieldConfig => {
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
    // If value is <= 1, treat as percentage; otherwise as pixels
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

export const generateUBEATCertificate = async (
    data: CertificateData,
    certificateType: 'pass' | 'credit' | 'distinction' = 'pass',
    customFields?: CertificateFieldsConfig,
): Promise<void> => {
    const { student, schoolName } = data;
    
    // Load custom fonts if provided
    try {
        await loadCustomFonts([
            {
                family: 'Handlee',
                url: '/fonts/Handlee-Regular.ttf',
                weight: 'normal',
                style: 'normal'
            }
        ])
    } catch (error) {
        console.error('Font loading failed:', error)
        // Continue with default fonts if custom fonts fail to load
    }
    
    const imagePath = (certificateType: 'pass' | 'credit' | 'distinction') => {
        switch (certificateType) {
            case 'pass': return '/images/FSLC/pass_level.png'
            case 'credit': return '/images/FSLC/credit_level.png'
            case 'distinction': return '/images/FSLC/distinction_level.png'
        }
    }

    // Select base config based on certificate type
    const baseConfig = certificateType === 'pass' 
        ? PASS_CONFIG 
        : certificateType === 'credit' 
            ? CREDIT_CONFIG 
            : DISTINCTION_CONFIG

    // Merge custom configs with certificate type specific defaults
    const fields = {
        studentName: mergeFieldConfig(baseConfig.studentName, customFields?.studentName),
        schoolName: mergeFieldConfig(baseConfig.schoolName, customFields?.schoolName),
        examNumber: mergeFieldConfig(baseConfig.examNumber, customFields?.examNumber),
        date: mergeFieldConfig(baseConfig.date, customFields?.date),
        serialNumber: mergeFieldConfig(baseConfig.serialNumber, customFields?.serialNumber),
        year: mergeFieldConfig(baseConfig.year, customFields?.year),
        gradeLevel: mergeFieldConfig(baseConfig.gradeLevel, customFields?.gradeLevel)
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
        
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            // Draw Student Name
            const studentNameConfig = fields.studentName
            setFont(ctx, studentNameConfig)
            ctx.textAlign = studentNameConfig.align as CanvasTextAlign
            ctx.fillStyle = studentNameConfig.color || '#000000'
            drawRotatedText(
                ctx,
                applyTransform(student.studentName, studentNameConfig.transform),
                calculatePosition(studentNameConfig.x, canvas.width),
                calculatePosition(studentNameConfig.y, canvas.height),
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
                calculatePosition(schoolNameConfig.x, canvas.width),
                calculatePosition(schoolNameConfig.y, canvas.height),
                schoolNameConfig.rotation
            )

            // Draw Exam Number (optional)
            if (customFields?.examNumber !== null) {
                const examNumberConfig = fields.examNumber
                setFont(ctx, examNumberConfig)
                ctx.textAlign = examNumberConfig.align as CanvasTextAlign
                ctx.fillStyle = examNumberConfig.color || '#000000'
                const examText = certificateType === 'pass' ? `Exam No: ${student.examNumber}` : `${student.examNumber}`
                drawRotatedText(
                    ctx,
                    applyTransform(examText, examNumberConfig.transform),
                    calculatePosition(examNumberConfig.x, canvas.width),
                    calculatePosition(examNumberConfig.y, canvas.height),
                    examNumberConfig.rotation
                )
            }

            // Draw Year (optional)
            if (customFields?.year !== null && (certificateType === 'credit' || certificateType === 'distinction')) {
                const yearConfig = fields.year
                setFont(ctx, yearConfig)
                ctx.textAlign = yearConfig.align as CanvasTextAlign
                ctx.fillStyle = yearConfig.color || '#000000'
                // Use student's examYear if available, otherwise use current year
                const examYear = student.examYear || new Date().getFullYear()
                const yearText = examYear.toString().slice(-2) // Get last 2 digits
                drawRotatedText(
                    ctx,
                    applyTransform(yearText, yearConfig.transform),
                    calculatePosition(yearConfig.x, canvas.width),
                    calculatePosition(yearConfig.y, canvas.height),
                    yearConfig.rotation
                )
            }

            // Draw Date
            const dateConfig = fields.date
            setFont(ctx, dateConfig)
            ctx.textAlign = dateConfig.align as CanvasTextAlign
            ctx.fillStyle = dateConfig.color || '#000000'
            // Use student's examYear if available, otherwise use current year
            const examYear = student.examYear || new Date().getFullYear()
            const dateStr = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: certificateType === 'pass' ? 'numeric' : undefined
            }).replace(/\d{4}/, examYear.toString()) // Replace year with examYear
            drawRotatedText(
                ctx,
                applyTransform(dateStr, dateConfig.transform),
                calculatePosition(dateConfig.x, canvas.width),
                calculatePosition(dateConfig.y, canvas.height),
                dateConfig.rotation
            )

            // Draw Serial Number (optional)
            if (customFields?.serialNumber !== null) {
                const serialConfig = fields.serialNumber
                setFont(ctx, serialConfig)
                ctx.textAlign = serialConfig.align as CanvasTextAlign
                ctx.fillStyle = serialConfig.color || '#000000'
                // Use student's examYear if available, otherwise use current year
                const examYear = student.examYear || new Date().getFullYear()
                const serialText = certificateType === 'pass' 
                    ? `S/N: ${student.serialNumber}` 
                    : examYear.toString().slice(-2); // Get last 2 digits
                drawRotatedText(
                    ctx,
                    applyTransform(serialText, serialConfig.transform),
                    calculatePosition(serialConfig.x, canvas.width),
                    calculatePosition(serialConfig.y, canvas.height),
                    serialConfig.rotation
                )
            }

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'))
                    return
                }

                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                const filename = `UBEAT_Certificate_${student.examNumber.replace(/\//g, '_')}.png`
                
                link.href = url
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
