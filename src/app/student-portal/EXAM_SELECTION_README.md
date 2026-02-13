# Student Portal - Exam Selection System

## Overview

The student portal now supports multiple examination types. Students must select their examination type before viewing their results.

## Flow

```
Landing Page (page.tsx)
    ↓
Select Exam Type (BECE / UBEAT / etc.)
    ↓
Exam Login (bece/page.tsx or ubeat/page.tsx)
    ↓
Enter Exam Number
    ↓
Dashboard (dashboard/page.tsx)
    ↓
View Results
```

## Available Exam Types

### 1. BECE (Basic Education Certificate Examination)
- **Status**: ✅ Active
- **Portal**: `/student-portal/dashboard?exam=bece`
- **Features**: 
  - View results
  - Download certificate
  - Print results
  - Payment verification

### 2. UBEAT (Universal Basic Education Achievement Test)
- **Status**: 🔜 Coming Soon
- **Portal**: `/student-portal/dashboard?exam=ubeat`
- **Features**: Will be similar to BECE portal

## Key Files

### 1. `/student-portal/page.tsx` (Landing/Exam Selection Page)
- Entry point for students
- Displays available examination types
- Shows which exams are active/coming soon
- Clean, sleek design with animated cards
- Routes to exam-specific login pages

### 2. `/student-portal/bece/page.tsx` (BECE Login Page)
- BECE-specific login interface
- Validates BECE exam number
- Stores `student_exam_no` and `selected_exam_type` in localStorage
- Redirects to dashboard after successful validation
- Back button to return to exam selection

### 3. `/student-portal/ubeat/page.tsx` (UBEAT Login Page)
- UBEAT-specific login interface (when implemented)
- Similar to BECE login but for UBEAT
- Validates UBEAT exam number format

### 4. `/student-portal/dashboard/page.tsx` (Results Dashboard)
- Checks for `selected_exam_type` in localStorage
- Redirects to landing page if not set
- Displays exam-specific branding and content
- Shows "Change Exam" button to switch between exam types

## LocalStorage Keys

| Key | Description | Example Value |
|-----|-------------|---------------|
| `student_exam_no` | Student's exam number | `"ok/977/2025/001"` |
| `student_data` | Complete student data object | `{...}` |
| `selected_exam_type` | Currently selected exam | `"bece"` or `"ubeat"` |
| `student-payment-return-url` | Payment callback URL | `/student-portal/dashboard` |

## Adding New Exam Types

To add a new examination type, follow these steps:

### 1. Update Landing Page

Edit `/student-portal/page.tsx`:

```typescript
const examTypes: ExamType[] = [
    // ... existing exam types ...
    {
        id: 'new-exam',
        name: 'NEW EXAM',
        fullName: 'New Examination Full Name',
        description: 'Access your results, check scores, and download certificate',
        icon: <IoIcon className="w-12 h-12" />,
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600',
        hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
        shadowColor: 'shadow-blue-500/30 hover:shadow-blue-500/50',
        available: true,  // Set to true when ready
        route: '/student-portal/new-exam'
    }
]
```

### 2. Create Exam-Specific Login Page

Create `/student-portal/new-exam/page.tsx`:

```typescript
// Copy from /student-portal/bece/page.tsx and modify:
// - Update exam number validation regex
// - Update API endpoint
// - Update branding (colors, text)
// - Update localStorage key: localStorage.setItem('selected_exam_type', 'new-exam')
```

### 3. Update Dashboard Logic

Edit `/student-portal/dashboard/page.tsx` to handle the new exam type:

```typescript
// Add exam type specific logic
if (examType === 'new-exam') {
    // Handle new exam type specific behavior
    // E.g., different API calls, different result display
}
```

### 4. Update API Endpoints

If the new exam has different API endpoints, update `/student-portal/utils/api.ts`:

```typescript
export const checkNewExamResult = async (examNo: string) => {
    const response = await fetch(`${API_BASE_URL}/new-exam-student/check-result/${examNo}`)
    return response.json()
}
```

### 5. Create Exam-Specific Components (Optional)

For exam-specific features, create:
- `/student-portal/dashboard/components/NewExamResultsCard.tsx`
- `/student-portal/dashboard/components/NewExamInfoCard.tsx`

### 6. Test the Flow

```
1. Visit /student-portal (landing)
2. Select new exam type
3. Verify redirect to /student-portal/new-exam
4. Enter exam number
5. Verify redirect to dashboard
6. Check localStorage has correct exam type
```

## UI Customization

### Exam Type Colors

Each exam type has its own color scheme:

| Exam | Primary Color | Gradient | Badge |
|------|---------------|----------|-------|
| BECE | Green (`#10b981`) | `from-green-500 to-green-600` | `bg-green-100 text-green-700` |
| UBEAT | Purple (`#9333ea`) | `from-purple-500 to-purple-600` | `bg-purple-100 text-purple-700` |

### Dynamic Branding

The dashboard automatically updates:
- Page title: `{EXAM_TYPE} Results Portal`
- Badge color scheme
- Icon colors
- Header text

## Features

### 1. Exam Type Badge
- Displays current exam type in the welcome banner
- Color-coded by exam type
- Always visible for clarity

### 2. Change Exam Button
- Located in dashboard header
- Allows switching between exam types
- Preserves student login session
- Returns to exam selection page

### 3. Validation
- Validates that an exam type is selected
- Redirects to selection page if missing
- Prevents accessing dashboard without selection

## Error Handling

### Missing Exam Selection
If `selected_exam_type` is not in localStorage:
- User is redirected to `/student-portal/select-exam`
- Toast message: "Please select your examination type"

### Invalid Exam Type
If an invalid exam type is stored:
- System falls back to 'bece'
- User can use "Change Exam" to correct

### No Exam Number
If `student_exam_no` is not in localStorage:
- User is redirected to `/student-portal` (login)
- Toast message: "Please enter your exam number first"

## Testing

### Test Flow

1. **Login Test**
   ```
   Navigate to /student-portal
   Enter valid exam number
   Verify redirect to /student-portal/select-exam
   ```

2. **Exam Selection Test**
   ```
   Select BECE (active)
   Verify redirect to dashboard with BECE branding
   
   Try selecting UBEAT (inactive)
   Verify "Coming Soon" toast message
   ```

3. **Dashboard Test**
   ```
   Verify BECE badge displays
   Verify correct exam type in header
   Click "Change Exam"
   Verify redirect to exam selection
   ```

4. **LocalStorage Test**
   ```typescript
   // Check after exam selection
   localStorage.getItem('selected_exam_type') === 'bece'
   
   // Check after logout
   localStorage.getItem('selected_exam_type') === null
   ```

## Mobile Responsiveness

The exam selection page is fully responsive:
- Grid layout: 1 column on mobile, 2 columns on desktop
- Touch-friendly buttons
- Responsive text sizing
- Mobile-optimized spacing

## Accessibility

- Keyboard navigation support
- Clear focus states
- Descriptive button labels
- ARIA labels for screen readers
- High contrast text

## Future Enhancements

### Planned Features
1. **Auto-detect Exam Type**: Automatically detect exam type from exam number format
2. **Multi-Exam Support**: Allow viewing results for multiple exams
3. **Exam History**: Track previously viewed exam types
4. **Quick Switch**: Dropdown to quickly switch between exam types from dashboard
5. **Exam-Specific Payment**: Different payment flows for different exam types

### API Integration
When UBEAT portal is ready:
1. Create `/ubeat-student/check-result/:examNo` endpoint
2. Update `api.ts` with UBEAT-specific functions
3. Create UBEAT-specific components
4. Set `available: true` in exam selection

## Troubleshooting

### Issue: Stuck on Loading Screen
**Solution**: Clear localStorage and try again
```typescript
localStorage.clear()
```

### Issue: Wrong Exam Type Displayed
**Solution**: Use "Change Exam" button or clear `selected_exam_type`
```typescript
localStorage.removeItem('selected_exam_type')
```

### Issue: Can't Select Exam
**Solution**: Ensure exam number is valid and stored
```typescript
console.log(localStorage.getItem('student_exam_no'))
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage values
3. Test with different exam numbers
4. Contact development team

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Active
