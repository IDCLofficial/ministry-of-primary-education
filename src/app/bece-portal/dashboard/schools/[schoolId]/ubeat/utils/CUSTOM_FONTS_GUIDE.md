# Using Custom Fonts in UBEAT Certificate Generator

This guide explains how to use custom fonts (like Handlee, custom handwriting fonts, etc.) in the UBEAT certificate generator.

## Quick Start

### 1. Place Your Font File

Put your font file in the `/public/fonts/` directory:
```
/public
  /fonts
    ├── Handlee-Regular.ttf
    ├── YourCustomFont-Bold.ttf
    └── AnotherFont-Italic.woff2
```

### 2. Import and Use

```typescript
import { generateUBEATCertificate, CustomFont } from './utils/certificateGenerator'

// Define your custom fonts
const customFonts: CustomFont[] = [
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf',
        weight: 'normal',
        style: 'normal'
    }
]

// Use in certificate generation
await generateUBEATCertificate(
    {
        student: ubeatStudentData,
        schoolName: 'SCHOOL NAME'
    },
    'pass',
    {
        studentName: {
            fontFamily: 'Handlee'  // Use the custom font
        }
    },
    customFonts  // Pass the custom fonts array
)
```

## Complete Example

### Example 1: Single Custom Font

```typescript
import { generateUBEATCertificate, CustomFont } from './utils/certificateGenerator'

const useHandleeFont = async () => {
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
            },
            date: {
                fontFamily: 'Handlee'
            }
        },
        customFonts
    )
}
```

### Example 2: Multiple Custom Fonts

```typescript
const customFonts: CustomFont[] = [
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf',
        weight: 'normal',
        style: 'normal'
    },
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Bold.ttf',
        weight: 'bold',
        style: 'normal'
    },
    {
        family: 'Cursive Script',
        url: '/fonts/CursiveScript.woff2',
        weight: 'normal',
        style: 'normal'
    }
]

await generateUBEATCertificate(
    { student, schoolName },
    'distinction',
    {
        studentName: {
            fontFamily: 'Cursive Script',
            fontSize: 140,
            fontWeight: 'normal'
        },
        schoolName: {
            fontFamily: 'Handlee',
            fontWeight: 'bold'
        },
        date: {
            fontFamily: 'Handlee'
        }
    },
    customFonts
)
```

### Example 3: Mix Custom and System Fonts

```typescript
const customFonts: CustomFont[] = [
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf'
    }
]

await generateUBEATCertificate(
    { student, schoolName },
    'credit',
    {
        studentName: {
            fontFamily: 'Handlee',  // Custom font
            fontSize: 130
        },
        schoolName: {
            fontFamily: 'Arial',    // System font
            fontSize: 90
        },
        date: {
            fontFamily: 'Times New Roman'  // System font
        }
    },
    customFonts
)
```

## CustomFont Interface

```typescript
interface CustomFont {
    family: string      // Font family name to use in CSS
    url: string         // Path to font file (relative to /public)
    weight?: string     // Font weight: 'normal', 'bold', '400', '700', etc.
    style?: string      // Font style: 'normal', 'italic'
}
```

### Font Format Support

The browser Font Loading API supports:
- `.ttf` (TrueType Font)
- `.otf` (OpenType Font)
- `.woff` (Web Open Font Format)
- `.woff2` (Web Open Font Format 2) - **Recommended for best compression**

## Important Notes

### 1. Font Loading is Asynchronous

Fonts are loaded before the certificate is generated. The function automatically waits for fonts to load.

```typescript
// The function handles loading internally
await generateUBEATCertificate(data, type, fields, customFonts)
// Fonts are loaded ✓
// Certificate is generated ✓
```

### 2. Font Loading Errors

If a font fails to load, the certificate generator will:
- Log the error to console
- Fall back to default fonts
- Continue generating the certificate

```typescript
// Even if Handlee fails to load, certificate will still generate
// It will just use the fallback font (e.g., Times New Roman)
```

### 3. Font Family Names

The `family` name must match exactly when used in `fontFamily`:

```typescript
// Define font
const customFonts: CustomFont[] = [
    {
        family: 'My Custom Font',  // ← This name
        url: '/fonts/custom.ttf'
    }
]

// Use font
customFields: {
    studentName: {
        fontFamily: 'My Custom Font'  // ← Must match exactly
    }
}
```

### 4. Font Weights and Styles

For different weights/styles, load them separately:

```typescript
const customFonts: CustomFont[] = [
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf',
        weight: 'normal'
    },
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Bold.ttf',
        weight: 'bold'
    }
]

// Now you can use both
customFields: {
    studentName: {
        fontFamily: 'Handlee',
        fontWeight: 'bold'  // Uses Handlee-Bold.ttf
    },
    schoolName: {
        fontFamily: 'Handlee',
        fontWeight: 'normal'  // Uses Handlee-Regular.ttf
    }
}
```

## Performance Tips

### 1. Preload Fonts

Load fonts once and reuse them:

```typescript
// Load once at component mount or page load
const [fontsLoaded, setFontsLoaded] = useState(false)

useEffect(() => {
    const preloadFonts = async () => {
        const fonts: CustomFont[] = [
            { family: 'Handlee', url: '/fonts/Handlee-Regular.ttf' }
        ]
        await loadCustomFonts(fonts)
        setFontsLoaded(true)
    }
    preloadFonts()
}, [])

// Then generate certificates without reloading fonts
const handleGenerate = async () => {
    await generateUBEATCertificate(
        { student, schoolName },
        'pass',
        {
            studentName: { fontFamily: 'Handlee' }
        }
        // No need to pass customFonts if already loaded
    )
}
```

### 2. Use WOFF2 Format

WOFF2 provides better compression and faster loading:

```typescript
{
    family: 'Handlee',
    url: '/fonts/Handlee-Regular.woff2'  // Smaller file size
}
```

## Troubleshooting

### Font Not Appearing

**Problem:** Custom font not rendering, using fallback instead

**Solutions:**
1. Check font file path is correct (relative to `/public`)
2. Verify font family name matches exactly
3. Check browser console for loading errors
4. Ensure font file is in a supported format

### Font Loading Timeout

**Problem:** Certificate generation is slow or hangs

**Solutions:**
1. Use WOFF2 format for smaller file size
2. Check network tab to verify font is downloading
3. Consider preloading fonts at app startup

### Font Appears Differently

**Problem:** Font looks wrong (weight, spacing, etc.)

**Solutions:**
1. Ensure correct font weight/style is loaded
2. Check if font file is corrupted
3. Try adjusting `fontSize` and `fontWeight` in field config

## Complete Implementation Example

```typescript
// Component implementation
import { useState } from 'react'
import { generateUBEATCertificate, CustomFont } from './utils/certificateGenerator'
import toast from 'react-hot-toast'

export default function CertificateGenerator() {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateCertificate = async () => {
        setIsGenerating(true)
        
        try {
            // Define custom fonts
            const customFonts: CustomFont[] = [
                {
                    family: 'Handlee',
                    url: '/fonts/Handlee-Regular.ttf',
                    weight: 'normal'
                }
            ]

            // Generate certificate with custom font
            await generateUBEATCertificate(
                {
                    student: studentData,
                    schoolName: 'EXAMPLE SCHOOL'
                },
                'pass',
                {
                    studentName: {
                        fontFamily: 'Handlee',
                        fontSize: 130,
                        color: '#1a1a1a'
                    },
                    date: {
                        fontFamily: 'Handlee',
                        fontSize: 100
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
            onClick={handleGenerateCertificate}
            disabled={isGenerating}
        >
            {isGenerating ? 'Generating...' : 'Download Certificate'}
        </button>
    )
}
```

## Resources

- [MDN: CSS Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API)
- [Google Fonts](https://fonts.google.com/) - Free fonts to download
- [Font Squirrel](https://www.fontsquirrel.com/) - Free commercial fonts
- [WOFF2 Converter](https://everythingfonts.com/woff2) - Convert TTF/OTF to WOFF2
