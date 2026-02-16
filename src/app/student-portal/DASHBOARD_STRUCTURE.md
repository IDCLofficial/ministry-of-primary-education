# Student Portal Dashboard Structure

## Overview
Each examination type in the student portal has its own dedicated dashboard with exam-specific styling and functionality.

## Exam-Specific Dashboards

### BECE Dashboard
- **Path:** `/student-portal/dashboard`
- **Login:** `/student-portal/bece`
- **Color Scheme:** Green
- **Description:** Basic Education Certificate Examination results dashboard
- **Features:**
  - Payment gateway integration
  - Paywall for unpaid results
  - Results display with subject breakdown
  - Download and print functionality
  - Certificate modal

### UBEAT Dashboard  
- **Path:** `/student-portal/ubeat/dashboard`
- **Login:** `/student-portal/ubeat`
- **Payment:** `/student-portal/ubeat/payment`
- **Color Scheme:** Purple
- **Description:** Universal Basic Education Achievement Test results dashboard
- **Features:**
  - Alternative login method (Name, School, LGA) with payment
  - Direct exam number login (free)
  - Results display with CA + Exam breakdown
  - Download and print functionality
  - Styled with Lottie animations and background graphics

## Routing Structure

```
/student-portal/
├── (landing page - exam selection)
├── bece/
│   └── (login page) → redirects to /student-portal/dashboard
├── dashboard/
│   └── (BECE dashboard)
└── ubeat/
    ├── (login page) → redirects to /student-portal/ubeat/dashboard
    ├── payment/
    │   └── (payment page for alternative login)
    └── dashboard/
        └── (UBEAT dashboard)
```

## Key Differences

### BECE Dashboard
- Uses API endpoint: `/bece-student/check-result/`
- Subject scores show: Exam score only
- Requires payment verification
- Generic exam number format validation

### UBEAT Dashboard
- Uses localStorage data (can be replaced with API)
- Subject scores show: CA + Exam + Total + Grade
- Alternative login with ₦500 payment
- Custom exam number format for UBEAT

## Design Consistency

Both dashboards maintain consistency in:
- Header with ministry branding
- Student information card layout
- Results table structure
- Print functionality
- Logout and navigation options

But differ in:
- Color scheme (Green for BECE, Purple for UBEAT)
- Login page design (BECE: simple form, UBEAT: with background + Lottie animations)
- Payment flow (BECE: paywall after login, UBEAT: optional payment for alternative login)
- Subject scoring display format

## Adding New Exam Types

To add a new exam type:

1. Create exam-specific folder: `/student-portal/{exam-name}/`
2. Create login page: `/student-portal/{exam-name}/page.tsx`
3. Create dashboard: `/student-portal/{exam-name}/dashboard/page.tsx`
4. Choose a unique color scheme
5. Update the landing page with new exam option
6. Implement exam-specific API endpoints if needed

## LocalStorage Keys

All dashboards use these consistent localStorage keys:
- `student_exam_no` - The student's examination number
- `student_data` - Complete student result data (JSON)
- `selected_exam_type` - The exam type identifier ('bece', 'ubeat', etc.)
- `payment_verified` - Payment status (for applicable exams)

## Payment Integration

### BECE
- Payment required to view results
- Uses `/result-payment/` API endpoints
- Paystack integration
- Paywall component shown if payment not verified

### UBEAT
- Payment optional (only for alternative login method)
- ₦500 fee for name-based lookup
- Direct exam number login is free
- Mock payment flow (can be replaced with real gateway)

## Notes

- Each exam dashboard is independent and self-contained
- The generic `/student-portal/dashboard` is specifically for BECE
- Future exam types should follow the same pattern: `/student-portal/{exam-type}/dashboard`
- Redux store is configured in the student-portal layout for RTK Query support
