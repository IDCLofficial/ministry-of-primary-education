/**
 * Example: Using Custom Fonts in UBEAT Certificate Generator
 * 
 * This file demonstrates how to use custom fonts like Handlee
 * in the certificate generator.
 */

import { generateUBEATCertificate, CustomFont, CertificateFieldsConfig } from './certificateGenerator'
import { UBEATStudent } from '../../../types/student.types'

/**
 * Example 1: Using Handlee font for student name
 */
export const generateWithHandleeFont = async (
    student: UBEATStudent,
    schoolName: string,
    certificateType: 'pass' | 'credit' | 'distinction' = 'pass'
) => {
    // Define custom fonts to load
    const customFonts: CustomFont[] = [
        {
            family: 'Handlee',
            url: '/fonts/Handlee-Regular.ttf',
            weight: 'normal',
            style: 'normal'
        }
    ]

    // Configure which fields use the custom font
    const customFields: CertificateFieldsConfig = {
        studentName: {
            fontFamily: 'Handlee',
            fontSize: 130,
            fontWeight: 'normal'
        },
        date: {
            fontFamily: 'Handlee',
            fontSize: 100
        }
    }

    // Generate certificate
    await generateUBEATCertificate(
        { student, schoolName },
        certificateType,
        customFields,
        customFonts
    )
}

/**
 * Example 2: Using multiple custom fonts
 */
export const generateWithMultipleFonts = async (
    student: UBEATStudent,
    schoolName: string
) => {
    const customFonts: CustomFont[] = [
        {
            family: 'Handlee',
            url: '/fonts/Handlee-Regular.ttf',
            weight: 'normal'
        },
        {
            family: 'Cursive Script',
            url: '/fonts/CursiveScript.woff2',
            weight: 'normal'
        }
    ]

    const customFields: CertificateFieldsConfig = {
        studentName: {
            fontFamily: 'Cursive Script',  // Fancy script for name
            fontSize: 140
        },
        schoolName: {
            fontFamily: 'Handlee',  // Handwritten for school
            fontSize: 90
        },
        date: {
            fontFamily: 'Times New Roman'  // Keep date formal
        }
    }

    await generateUBEATCertificate(
        { student, schoolName },
        'distinction',
        customFields,
        customFonts
    )
}

/**
 * Example 3: Preloading fonts for better performance
 * 
 * Load fonts once at app startup, then generate multiple certificates
 * without reloading fonts each time.
 */

// Global font cache
let fontsPreloaded = false

const preloadFonts = async () => {
    if (fontsPreloaded) return

    const customFonts: CustomFont[] = [
        {
            family: 'Handlee',
            url: '/fonts/Handlee-Regular.ttf'
        }
    ]

    // Load fonts using the Font Loading API
    for (const font of customFonts) {
        const fontFace = new FontFace(font.family, `url(${font.url})`)
        const loadedFont = await fontFace.load()
        document.fonts.add(loadedFont)
    }

    fontsPreloaded = true
}

export const generateWithPreloadedFonts = async (
    student: UBEATStudent,
    schoolName: string
) => {
    // Preload fonts once
    await preloadFonts()

    // Now generate certificate - fonts are already loaded
    await generateUBEATCertificate(
        { student, schoolName },
        'pass',
        {
            studentName: {
                fontFamily: 'Handlee',
                fontSize: 130
            }
        }
        // No need to pass customFonts since they're already loaded
    )
}

/**
 * Example 4: Complete component implementation
 * 
 * Shows how to integrate custom fonts into a React component
 * with loading states and error handling.
 */
export const certificateComponentExample = `
import { useState } from 'react'
import { generateUBEATCertificate, CustomFont } from './utils/certificateGenerator'
import toast from 'react-hot-toast'

export default function CertificateButton({ student, schoolName }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        
        try {
            const customFonts: CustomFont[] = [
                {
                    family: 'Handlee',
                    url: '/fonts/Handlee-Regular.ttf'
                }
            ]

            await generateUBEATCertificate(
                { student, schoolName },
                'pass',
                {
                    studentName: {
                        fontFamily: 'Handlee',
                        fontSize: 130
                    }
                },
                customFonts
            )

            toast.success('Certificate downloaded!')
        } catch (error) {
            console.error('Certificate generation failed:', error)
            toast.error('Failed to generate certificate')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded"
        >
            {isGenerating ? (
                <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                </>
            ) : (
                'Download Certificate'
            )}
        </button>
    )
}
`

/**
 * Utility: Get available custom fonts configuration
 */
export const AVAILABLE_CUSTOM_FONTS = {
    handlee: {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf',
        weight: 'normal',
        style: 'normal',
        description: 'Casual handwritten font, good for informal certificates'
    }
    // Add more fonts as you add them to /public/fonts/
} as const

/**
 * Helper function: Generate with a preset custom font
 */
export const generateWithPreset = async (
    student: UBEATStudent,
    schoolName: string,
    fontPreset: keyof typeof AVAILABLE_CUSTOM_FONTS,
    certificateType: 'pass' | 'credit' | 'distinction' = 'pass'
) => {
    const fontConfig = AVAILABLE_CUSTOM_FONTS[fontPreset]
    
    const customFonts: CustomFont[] = [
        {
            family: fontConfig.family,
            url: fontConfig.url,
            weight: fontConfig.weight,
            style: fontConfig.style
        }
    ]

    const customFields: CertificateFieldsConfig = {
        studentName: {
            fontFamily: fontConfig.family,
            fontSize: 130
        }
    }

    await generateUBEATCertificate(
        { student, schoolName },
        certificateType,
        customFields,
        customFonts
    )
}

// Usage:
// await generateWithPreset(student, school, 'handlee', 'pass')
