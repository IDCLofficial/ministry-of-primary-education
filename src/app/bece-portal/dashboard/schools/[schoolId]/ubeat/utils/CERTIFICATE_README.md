# UBEAT Certificate Generator

## Overview
The UBEAT certificate generator creates downloadable certificates by overlaying student information onto the official certificate template using HTML5 Canvas. It supports full customization of all text fields including position, font, color, and styling.

## How It Works

1. **Image Loading**: Loads the certificate template from `/public/images/FSLC/pass_level.png`
2. **Canvas Creation**: Creates an HTML5 canvas element matching the image dimensions
3. **Text Overlay**: Draws student information at customizable positions on the canvas
4. **Download**: Converts the canvas to a PNG image and triggers a download

## Basic Usage

```typescript
import { generateUBEATCertificate } from './utils/certificateGenerator'

// Simple usage with default positioning
await generateUBEATCertificate({
    student: ubeatStudentData,
    schoolName: 'SCHOOL NAME'
})
```

## Advanced Usage - Custom Positioning

```typescript
import { generateUBEATCertificate, CertificateFieldsConfig } from './utils/certificateGenerator'

// Customize specific fields
const customConfig: CertificateFieldsConfig = {
    studentName: {
        y: 0.40,           // Move up (40% from top instead of 42%)
        fontSize: 130,     // Larger font
        color: '#1a1a1a'   // Darker color
    },
    schoolName: {
        fontSize: 100,     // Smaller font
        fontWeight: 'bold' // Make it bold
    },
    examNumber: null,      // Hide exam number field
    date: {
        x: 0.20,           // Move date slightly right
        fontSize: 110      // Adjust size
    }
}

await generateUBEATCertificate(
    {
        student: ubeatStudentData,
        schoolName: 'SCHOOL NAME'
    },
    customConfig
)
```

## Available Fields

The certificate generator supports the following customizable fields:

| Field | Default Position | Default Font | Default Align | Default Transform |
|-------|------------------|--------------|---------------|-------------------|
| **studentName** | Center, 42% from top | Bold 120px | Center | UPPERCASE |
| **schoolName** | Center, 52.5% from top | 120px | Center | UPPERCASE |
| **examNumber** | Center, 58% from top | Italic 80px | Center | None |
| **date** | 18% from left, 92.5% from top | 120px | Left | None |
| **serialNumber** | 82% from left, 92.5% from top | 80px | Right | None |

## Field Configuration Options

Each field supports the following customization options:

```typescript
interface FieldConfig {
    x: number          // X position: 0-1 (percentage) or >1 (pixels)
    y: number          // Y position: 0-1 (percentage) or >1 (pixels)
    fontSize: number   // Font size in pixels
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    fontFamily?: string    // Default: 'Times New Roman'
    align?: 'left' | 'center' | 'right'
    color?: string         // Hex color code, e.g., '#000000'
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
    rotation?: number      // Rotation angle in degrees (default: 0)
}
```

## Customization Examples

### Example 1: Adjust Student Name Position
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            y: 0.40,        // Move up 2%
            fontSize: 140   // Increase size
        }
    }
)
```

### Example 2: Hide Exam Number
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        examNumber: null  // Don't render exam number
    }
)
```

### Example 3: Custom Colors and Fonts
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            color: '#1a472a',      // Dark green
            fontWeight: 'bold'
        },
        schoolName: {
            color: '#0066cc',      // Blue
            fontStyle: 'italic'
        }
    }
)
```

### Example 4: Use Pixel Positioning
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            x: 1500,  // Absolute pixel position
            y: 800    // Absolute pixel position
        }
    }
)
```

### Example 5: Change Text Transform
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            transform: 'capitalize'  // Only first letter capitalized
        },
        schoolName: {
            transform: 'none'  // Keep original case
        }
    }
)
```

### Example 6: Apply Text Rotation
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            rotation: 5  // Rotate 5 degrees clockwise
        },
        date: {
            rotation: -3  // Rotate 3 degrees counter-clockwise
        },
        serialNumber: {
            rotation: 90  // Rotate 90 degrees (vertical text)
        }
    }
)
```

### Example 7: Complex Multi-Property Customization
```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            fontSize: 140,
            color: '#1a472a',
            fontWeight: 'bold',
            rotation: 2,
            y: 0.40
        },
        date: {
            fontSize: 90,
            color: '#666666',
            fontStyle: 'italic',
            rotation: -1,
            x: 0.15
        }
    }
)
```

## File Output

- **Format**: PNG image
- **Filename**: `UBEAT_Certificate_{ExamNumber}.png`
- **Example**: `UBEAT_Certificate_NJ_010_0453.png`

## Adding Multiple Certificate Types

To support different certificate levels (Pass, Credit, Distinction):

1. Add certificate images to `/public/`:
   - `ubeat_pass_certificate.png`
   - `ubeat_credit_certificate.png`
   - `ubeat_distinction_certificate.png`

2. Update the generator to accept certificate type
3. Load the appropriate image based on student grade

## Testing and Adjusting Positions

### Method 1: Using Percentages (Recommended)

1. Generate a certificate with default settings
2. Open in image editor (Photoshop, GIMP, Preview)
3. Measure pixel position where text should be
4. Calculate percentage:
   - X: `(pixelX / imageWidth)`
   - Y: `(pixelY / imageHeight)`
5. Update configuration

**Example:**
- Image width: 3000px, desired X position: 1500px
- Percentage: `1500 / 3000 = 0.5` (50% from left)

### Method 2: Using Absolute Pixels

For precise positioning, use pixel values directly:

```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        studentName: {
            x: 1500,  // Exact pixel position
            y: 1200   // Exact pixel position
        }
    }
)
```

### Method 3: Incremental Testing

Start with defaults and adjust incrementally:

```typescript
// Try moving student name down by 5%
studentName: { y: 0.42 + 0.05 }

// Try moving left by 10%
studentName: { x: 0.5 - 0.10 }
```

## Position Calculation System

The generator uses a smart position calculation system:

- **Values ≤ 1**: Treated as percentages (e.g., `0.5` = 50% of width/height)
- **Values > 1**: Treated as absolute pixels (e.g., `1500` = 1500px)

This allows you to mix percentage and pixel positioning:

```typescript
{
    studentName: {
        x: 0.5,      // 50% from left (percentage)
        y: 800       // 800 pixels from top (absolute)
    }
}
```

## Field Visibility Control

To hide specific fields, set them to `null` in the custom config:

```typescript
await generateUBEATCertificate(
    { student, schoolName },
    {
        examNumber: null,      // Don't render exam number
        serialNumber: null     // Don't render serial number
    }
)
```

## Supported Fonts

### Web-Safe Fonts

The default font is **Times New Roman**, but you can use any web-safe font:

- Times New Roman (default - formal)
- Arial (clean, modern)
- Georgia (elegant serif)
- Courier New (monospace)
- Verdana (readable sans-serif)

```typescript
studentName: {
    fontFamily: 'Georgia'  // Use Georgia instead
}
```

### Custom Fonts

You can also use **custom fonts** (TTF, OTF, WOFF, WOFF2) like Handlee or handwriting fonts:

```typescript
import { generateUBEATCertificate, CustomFont } from './utils/certificateGenerator'

// Define custom fonts
const customFonts: CustomFont[] = [
    {
        family: 'Handlee',
        url: '/fonts/Handlee-Regular.ttf'
    }
]

// Use custom font
await generateUBEATCertificate(
    { student, schoolName },
    'pass',
    {
        studentName: {
            fontFamily: 'Handlee',  // Use custom font
            fontSize: 130
        }
    },
    customFonts  // Pass custom fonts array
)
```

**📖 For detailed instructions on using custom fonts, see [CUSTOM_FONTS_GUIDE.md](./CUSTOM_FONTS_GUIDE.md)**

## Notes

- **Font Rendering**: Uses Times New Roman font for official appearance
- **Text Transform**: Supports uppercase, lowercase, capitalize, or none
- **Text Rotation**: Supports rotation in degrees (positive = clockwise, negative = counter-clockwise, default = 0)
- **Color Support**: Hex color codes for all text elements
- **Cross-Origin**: Images must be properly configured for canvas rendering
- **Client-Side Only**: Canvas rendering happens in the browser
- **High Resolution**: Maintains original image resolution for quality
- **File Format**: Outputs as PNG for best quality and compatibility

## Rotation Details

- **Angle Unit**: Degrees (not radians)
- **Direction**: Positive values rotate clockwise, negative values rotate counter-clockwise
- **Default**: 0 degrees (no rotation)
- **Examples**:
  - `rotation: 0` - No rotation (horizontal)
  - `rotation: 45` - Tilted 45° to the right
  - `rotation: -45` - Tilted 45° to the left
  - `rotation: 90` - Vertical text (rotated right)
  - `rotation: -90` - Vertical text (rotated left)
- **Rotation Point**: Text rotates around its position coordinates (x, y)
- **Text Alignment**: The `align` property (left, center, right) is applied before rotation
