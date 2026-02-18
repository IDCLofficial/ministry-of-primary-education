# MOPSE Portal System Documentation

## Overview

The MOPSE (Imo State Ministry of Primary and Secondary Education) Portal is a Next.js-based web application that enables schools to register, login, and manage examination applications. The system consists of three main sections: Login, Registration, and Dashboard.

---

## Architecture

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit (RTK Query)
- **Styling**: TailwindCSS
- **Authentication**: JWT-based token authentication
- **UI Components**: Custom components with React

### Directory Structure
```
src/app/portal/
├── page.tsx                    # Login page
├── register/
│   └── page.tsx               # School registration page
├── dashboard/
│   ├── layout.tsx             # Dashboard layout with auth protection
│   ├── page.tsx               # Main dashboard (exam selection)
│   ├── [examId]/              # Dynamic exam routes
│   ├── components/            # Dashboard-specific components
│   └── exams/                 # Exam type definitions
├── providers/
│   └── AuthProvider.tsx       # Authentication context provider
└── store/
    └── api/
        └── authApi.ts         # API endpoints for auth operations
```

---

## 1. Portal Login Page (`/portal/page.tsx`)

### Purpose
Entry point for schools to authenticate and access the dashboard.

### Key Features
- **Email/Password Authentication**: Standard login form with validation
- **Real-time Validation**: Debounced field validation (500ms delay)
- **First-time Login Detection**: Redirects to password creation if needed
- **Session Persistence**: Checks for existing authentication tokens
- **Responsive Design**: Mobile-friendly layout with ministry branding

### Component Structure
```tsx
<div className="min-h-screen">
  <HangingTree />              // Decorative background element
  <header>                     // Ministry logo and name
  <main>
    <LoginForm />              // Main login form component
    <Link to="/portal/register"> // Registration link
  </main>
</div>
```

### Authentication Flow
1. User enters email and password
2. Form validates input (email format, password length ≥6)
3. Submits credentials via `useLoginMutation` hook
4. On success:
   - Stores `access_token` and `school` data in localStorage
   - Calls `login()` from AuthProvider
   - Redirects to `/portal/dashboard`
5. On error:
   - **400**: First-time login → redirect to `/portal/create-password`
   - **401**: Invalid credentials → show error toast
   - Other errors → generic error message

### Validation Rules
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

---

## 2. School Registration Page (`/portal/register/page.tsx`)

### Purpose
Allows new schools to register for portal access.

### Key Features
- **Multi-step Form**: LGA selection → School selection → Contact details
- **Dynamic School Loading**: Fetches schools based on selected LGA
- **Duplicate Prevention**: Checks if school already has an account
- **Real-time Validation**: Debounced validation for all fields
- **Searchable Dropdowns**: Custom dropdown with search functionality

### Component Structure
```tsx
<div className="min-h-screen">
  <HangingTree />
  <header>                     // Ministry branding
  <main>
    <RegistrationForm />       // Multi-field registration form
    <Link to="/portal">        // Login link
  </main>
</div>
```

### Registration Flow
1. **Select LGA**: Choose from 27 Imo State LGAs
2. **Select School**: Dropdown populates with schools from selected LGA
3. **Enter Details**:
   - School Address
   - Principal Name
   - Contact Email
   - Contact Phone
4. **Validation**: All fields validated in real-time
5. **Submission**: 
   - Sends data via `useRegisterSchoolMutation`
   - On success: Email sent with login credentials
   - Redirects to login page after 2 seconds

### Validation Rules
- **LGA**: Required, must be valid Imo State LGA
- **School Name**: Required, must not have existing account
- **School Address**: Required
- **Principal Name**: Required, min 2 chars, letters/spaces/hyphens only
- **Contact Email**: Required, valid email format
- **Contact Phone**: Required, 10-15 digits

### LGA List (27 Total)
Aboh Mbaise, Ahiazu Mbaise, Ehime Mbano, Ezinihitte, Ideato North, Ideato South, Ihitte/Uboma, Ikeduru, Isiala Mbano, Isu, Mbaitoli, Ngor Okpala, Njaba, Nkwerre, Nwangele, Obowo, Oguta, Ohaji/Egbema, Okigwe, Onuimo, Orlu, Orsu, Oru East, Oru West, Owerri Municipal, Owerri North, Owerri West

---

## 3. Dashboard (`/portal/dashboard/`)

### Layout (`layout.tsx`)

#### Purpose
Wraps all dashboard pages with authentication and loading state management.

#### Features
- **AuthProvider**: Provides authentication context to all child components
- **ProtectedRoute**: Ensures only authenticated users can access dashboard
- **NextTopLoader**: Shows loading bar during page transitions
- **Persistent Layout**: Maintains state across dashboard navigation

#### Structure
```tsx
<AuthProvider>
  <ProtectedRoute requireAuth={true}>
    <div className="min-h-screen">
      <NextTopLoader />
      {children}
    </div>
  </ProtectedRoute>
</AuthProvider>
```

---

### Main Dashboard Page (`page.tsx`)

#### Purpose
Displays all available examinations with their status and details.

#### Key Features
- **Exam Grid Display**: Responsive grid showing all 8 exam types
- **Status Badges**: Visual indicators for exam application status
- **Dynamic Status**: Fetches exam status from school profile
- **Fee Display**: Shows regular and late fees for each exam
- **Click-to-Navigate**: Each exam card links to its specific page

#### Exam Status Types
1. **Not Applied** (Gray): School hasn't applied for this exam
2. **Pending** (Yellow): Application submitted, awaiting approval
3. **Approved** (Green): Application approved, can proceed with registration
4. **Rejected** (Red): Application rejected
5. **Completed** (Blue): Exam process completed
6. **Onboarded** (Purple): Students onboarded for exam

#### Exam Types (8 Total)

| ID | Name | Fee | Late Fee | Description |
|---|---|---|---|---|
| `waec` | WAEC | ₦7,000 | ₦7,500 | West African Senior School Certificate Examination |
| `ubegpt` | UBEGPT | ₦5,000 | ₦5,500 | Universal Basic Education General Placement Test |
| `ubetms` | UBETMS | ₦3,000 | - | Universal Basic Education Test into Model Schools |
| `cess` | CESS | ₦3,000 | ₦3,500 | Common Entrance into Science Schools |
| `bece` | BECE | ₦7,000 | ₦7,500 | Basic Education Certificate Examination |
| `bece-resit` | BECE Resit | ₦2,000 | - | Resit Exams for BECE |
| `ubeat` | UBEAT | ₦5,000 | ₦5,500 | Universal Basic Education Assessment Test |
| `jscbe` | JSCBE | ₦7,000 | ₦7,500 | Junior School Business Certificate Examination |

#### Status Mapping Logic
```typescript
// Maps API exam names to frontend exam IDs
const examNameToId = {
  'UBEGPT': 'ubegpt',
  'UBETMS': 'ubetms',
  'Common-entrance': 'cess',
  'BECE': 'bece',
  'BECE-resit': 'bece-resit',
  'UBEAT': 'ubeat',
  'JSCBE': 'jscbe',
  'WAEC': 'waec'
}
```

---

## 4. Authentication System

### AuthProvider (`providers/AuthProvider.tsx`)

#### Purpose
Centralized authentication state management using React Context.

#### Features
- **Token Management**: Stores and validates JWT tokens
- **Profile Fetching**: Automatically fetches user profile on mount
- **Session Persistence**: Maintains login across page refreshes
- **Auto-logout**: Clears session on profile fetch errors
- **Profile Refresh**: Manual refresh capability for updated data

#### Context Interface
```typescript
interface AuthContextType {
  isAuthenticated: boolean
  school: School | null
  token: string | null
  login: (token: string, school: School) => void
  logout: () => void
  loggingOut: boolean
  isLoading: boolean
  refreshProfile: () => void
  isFetchingProfile: boolean
}
```

#### School Object Structure
```typescript
interface School {
  applicationId?: string
  id: string
  schoolName: string
  email: string
  isFirstLogin: boolean
  address: string
  phone: string
  numberOfStudents?: number
  status?: string
  exams: ExamData[]  // Array of exam applications
}
```

#### Authentication Flow
1. **On Mount**: Check localStorage for `access_token` and `school`
2. **If Found**: 
   - Set token and enable profile query
   - Fetch fresh profile data from API
   - Update context with profile data
3. **If Not Found**: Set `isLoading = false`
4. **On Profile Error**: Automatically logout user

#### Login Method
```typescript
login(token, school) {
  localStorage.setItem('access_token', token)
  localStorage.setItem('school', JSON.stringify(school))
  setToken(token)
  setSchool(school)
  setIsAuthenticated(true)
  refetchProfile()  // Fetch fresh data
}
```

#### Logout Method
```typescript
logout() {
  setToken(null)
  setSchool(null)
  setIsAuthenticated(false)
  localStorage.removeItem('access_token')
  localStorage.removeItem('school')
  router.push('/portal')
}
```

---

## 5. Dashboard Header Component

### Purpose
Persistent header across all dashboard pages showing school info and logout.

### Features
- **School Information**: Displays school name and status
- **Status Indicator**: Color-coded status display
- **Logout Button**: Clears session and redirects to login
- **Responsive Design**: Adapts to mobile/desktop screens
- **Loading State**: Shows skeleton while fetching data

### Status Colors
- **Approved**: Green (`text-green-700`)
- **Pending**: Yellow (`text-yellow-600`)
- **Rejected**: Red (`text-red-600`)
- **Completed**: Blue (`text-blue-600`)
- **Default**: Gray (`text-gray-500`)

---

## 6. API Integration (RTK Query)

### Endpoints

#### `useLoginMutation`
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ access_token, school }`

#### `useRegisterSchoolMutation`
- **Method**: POST
- **Endpoint**: `/auth/register`
- **Body**: `{ lga, schoolName, schoolAddress, principalName, contactEmail, contactPhone }`
- **Response**: Success message

#### `useGetSchoolNamesQuery`
- **Method**: GET
- **Endpoint**: `/schools?lga={lga}`
- **Response**: Array of school objects with `schoolName` and `hasAccount`

#### `useGetProfileQuery`
- **Method**: GET
- **Endpoint**: `/auth/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: School profile object

---

## 7. Shared Components

### FormInput
Reusable input component with validation error display.

### CustomDropdown
Searchable dropdown with custom styling and filtering.

### HangingTree
Decorative SVG background element for portal pages.

### ProtectedRoute
HOC that redirects unauthenticated users to login page.

---

## 8. Utilities

### useDebounce Hook
Delays value updates to reduce API calls during typing.
- **Delay**: 500ms
- **Usage**: Form field validation

### formatCurrency
Formats numbers as Nigerian Naira (₦).
```typescript
formatCurrency(5000) // "₦5,000"
```

---

## 9. User Workflows

### New School Registration
1. Navigate to `/portal/register`
2. Select LGA from dropdown
3. Select school from populated list
4. Fill in contact details
5. Submit form
6. Receive email with credentials
7. Navigate to login page

### School Login
1. Navigate to `/portal`
2. Enter email and password
3. Click "Login"
4. Redirected to dashboard

### Viewing Exam Options
1. Login to dashboard
2. View grid of 8 exam types
3. See status badge for each exam
4. Click exam card to view details

### Applying for Exam
1. Click exam card from dashboard
2. Navigate to `/portal/dashboard/{examId}`
3. Fill application form
4. Submit for approval

---

## 10. Security Features

- **JWT Authentication**: Token-based authentication
- **Protected Routes**: Dashboard requires valid token
- **Auto-logout**: Invalid tokens trigger automatic logout
- **Input Sanitization**: All inputs trimmed before submission
- **Error Handling**: Graceful error messages without exposing internals
- **Session Validation**: Profile refetch validates token on mount

---

## 11. Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (xl)

### Adaptive Elements
- Header text (full name vs abbreviation)
- Grid layout (1-4 columns based on screen size)
- Form widths (max-w-md to max-w-2xl)
- Button sizes and padding

---

## 12. Error Handling

### Login Errors
- **400**: First-time login → Redirect to password creation
- **401**: Invalid credentials → Error toast
- **Network**: Connection error message

### Registration Errors
- **Duplicate School**: "School already has an account"
- **Invalid Data**: Field-specific error messages
- **Server Error**: Generic error with retry option

### Profile Errors
- **401/403**: Auto-logout and redirect to login
- **Network**: Retry mechanism with error display

---

## 13. State Management

### Local State (useState)
- Form data
- Validation errors
- Loading states
- UI toggles

### Context State (AuthProvider)
- Authentication status
- User/school data
- Token management

### Server State (RTK Query)
- API data fetching
- Caching
- Automatic refetching
- Loading/error states

---

## 14. Future Enhancements

Potential areas for expansion:
- Password reset functionality
- Multi-factor authentication
- Real-time notifications
- Exam result viewing
- Student bulk upload
- Payment integration
- Certificate generation
- Admin dashboard

---

## 15. Development Notes

### Running the Portal
```bash
npm run dev
# Navigate to http://localhost:3000/portal
```

### Environment Variables
Ensure API endpoints are configured in environment variables.

### Testing Accounts
Use registered school credentials or create new registration.

---

## Support

For technical issues or questions about the portal system, contact the MOPSE IT department.

**Last Updated**: February 2026
