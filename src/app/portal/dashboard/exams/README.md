# Examination Portal System

## Overview
This system provides a comprehensive examination management portal for schools to apply for and manage various examinations offered by the Ministry of Primary and Secondary Education.

## Examinations Available

1. **UBEGPT** - Universal Basic Education General Placement Test
   - Fee: ₦5,000 (Late: ₦5,500)
   
2. **UBETMS** - Universal Basic Education Test into Model Schools
   - Fee: ₦3,000
   
3. **CESS** - Common Entrance into Science Schools
   - Fee: ₦3,000 (Late: ₦3,500)
   
4. **BECE** - Basic Education Certificate Examination
   - Fee: ₦7,000 (Late: ₦7,500)
   
5. **BECE Resit** - Resit Exams (BECE)
   - Fee: ₦2,000
   
6. **UBEAT** - Universal Basic Education Assessment Test
   - Fee: ₦5,000 (Late: ₦5,500)
   
7. **JSCBE** - Junior School Business Certificate Examination
   - Fee: ₦7,000 (Late: ₦7,500)

## User Flow

### 1. Exam Landing Page (`/portal/dashboard/exams`)
- Displays all 7 examinations as cards
- Shows exam name, description, fees, and late fees
- Click any exam card to proceed to that exam's page

### 2. Exam Application Form
- **Shown when**: School has not applied for the exam OR application is pending
- **Pre-filled data**: School name, contact email (from authenticated school)
- **Required fields**:
  - Number of students
  - Contact phone
  - Additional notes (optional)
- **Displays**: Total fee calculation based on number of students
- **On submit**: Creates application and shows pending status

### 3. Pending Status
- **Shown when**: Application submitted but not yet approved
- Displays a yellow alert indicating application is under review
- User cannot access dashboard until approved

### 4. Exam Dashboard
- **Shown when**: Application is approved
- Full dashboard identical to the main BECE dashboard
- Features:
  - Student registration and management
  - Filtering and sorting
  - Payment processing
  - Onboarding completion tracking
  - Cost summary
  - All standard dashboard features

## File Structure

```
/portal/dashboard/exams/
├── types.ts                          # Exam types and configuration
├── page.tsx                          # Landing page with all exams
├── README.md                         # This file
└── [examId]/
    ├── page.tsx                      # Individual exam page
    └── components/
        └── ExamApplicationForm.tsx   # Application form component
```

## API Integration (To Be Implemented)

### Required Endpoints:

1. **GET /api/exam-applications/:schoolId**
   - Returns all exam applications for a school
   - Response: Array of ExamApplication objects

2. **POST /api/exam-applications**
   - Creates a new exam application
   - Body: { examType, schoolId, numberOfStudents, contactPhone, additionalNotes }
   - Response: Created ExamApplication object

3. **GET /api/exam-applications/:schoolId/:examType**
   - Returns specific exam application status
   - Response: ExamApplication object or null

4. **PATCH /api/exam-applications/:applicationId/status**
   - Updates application status (admin only)
   - Body: { status: 'approved' | 'rejected', reviewNotes? }

### ExamApplication Interface:
```typescript
interface ExamApplication {
  _id: string
  examType: string
  schoolId: string
  status: 'pending' | 'approved' | 'rejected'
  numberOfStudents: number
  contactPhone: string
  additionalNotes?: string
  appliedAt: string
  approvedAt?: string
  rejectedAt?: string
  reviewNotes?: string
}
```

## Current Implementation Status

✅ Exam types configuration with all 7 exams
✅ Exam landing page with cards
✅ Individual exam pages with routing
✅ Application form with pre-filled school data
✅ Pending status display
✅ Full exam dashboard (reuses existing components)
✅ Navigation between pages
✅ Main dashboard button to access exams

⚠️ **Mock Data**: Currently uses mock application status (hasApplied, isApproved)
⚠️ **API Integration**: Needs backend endpoints to be created

## Next Steps for Backend Integration

1. Create exam applications table/collection in database
2. Implement the 4 API endpoints listed above
3. Add authentication middleware to protect endpoints
4. Update ExamApplicationForm to call POST endpoint
5. Update ExamPage to fetch application status from GET endpoint
6. Add admin interface to approve/reject applications
7. Implement email notifications for application status changes

## Usage

From the main dashboard, click "View Examinations" button to access the exam portal. Schools can then:
1. Browse available examinations
2. Apply for exams they haven't registered for
3. View pending applications
4. Access exam dashboards once approved
