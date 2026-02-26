import { IoSchoolOutline, IoBookOutline, IoFileTrayStackedOutline, IoCashOutline, IoBuildOutline } from 'react-icons/io5'

export interface FAQItem {
  question: string
  answer: string
  category: 'registration' | 'login' | 'dashboard' | 'exams' | 'technical' | 'security' | 'application-process'
}

export interface CategoryInfo {
  [key: string]: {
    title: string
    icon: React.ComponentType<{ className?: string }>
  }
}

export const allFAQs: FAQItem[] = [
  {
    category: 'registration',
    question: 'How do I register as an Area Education Executive (AEE)?',
    answer: 'Navigate to the registration page from the login screen. Provide your full name, select your LGA from the dropdown, enter your email address, and phone number. After submission, you\'ll receive login credentials via email within 24 hours. As an AEE, you will manage all schools within your LGA.'
  },
  {
    category: 'registration',
    question: 'What is the difference between AEE and school accounts?',
    answer: 'AEE (Area Education Executive) accounts are LGA-level accounts that manage multiple schools within a specific Local Government Area. Each AEE can view and manage exam applications for all schools in their LGA. Individual school accounts are no longer used - all management is done at the LGA level.'
  },
  {
    category: 'registration',
    question: 'Can I register multiple times?',
    answer: 'No, each LGA can only have one AEE account. If your LGA already has an account, the system will notify you during registration. Contact the Ministry if you need to recover existing login credentials or transfer account ownership.'
  },
  {
    category: 'registration',
    question: 'What information do I need to register?',
    answer: 'You need: Your full name, the LGA you manage, a valid email address for official communications, and a working phone number (at least 10 digits). Ensure all information is accurate as it will be used for official communications and account recovery.'
  },
  {
    category: 'login',
    question: 'How do I log in to the portal?',
    answer: 'Go to the portal login page and enter your registered email address and password. If it\'s your first time logging in, you\'ll be redirected to create a new password. After that, you can access your dashboard directly.'
  },
  {
    category: 'login',
    question: 'What are the different entry points to the portal?',
    answer: 'The portal has several entry points: (1) Main Login Page (/portal) - for existing users with credentials, (2) Registration Page - for new AEE registration (accessible from login page), (3) Forgot Password Page (/portal/forgot-password) - to reset your password, (4) Reset Password Page (/portal/reset-password) - accessed via email link after requesting password reset. All entry points are public and don\'t require authentication except the dashboard.'
  },
  {
    category: 'login',
    question: 'What happens after I successfully log in?',
    answer: 'After successful login, you\'re redirected to your AEE dashboard. The dashboard shows your LGA overview, all schools under your management, and quick access to examination portals. Your session remains active until you log out or it expires for security.'
  },
  {
    category: 'login',
    question: 'Why am I being redirected to create a password?',
    answer: 'This happens on your first login. The system requires you to create a secure password to protect your school\'s account. Choose a strong password with at least 6 characters that you can remember.'
  },
  {
    category: 'login',
    question: 'Can multiple people use the same AEE account?',
    answer: 'Yes, but we recommend sharing credentials only with authorized education officials in your LGA. Each LGA has one AEE account, so coordinate with your colleagues to avoid conflicts when submitting applications or managing school data.'
  },
  {
    category: 'login',
    question: 'What should I do if I forget my password?',
    answer: 'Click the "Forgot password?" link on the login page. Enter your registered email address and you\'ll receive a password reset link via email. Click the link in the email to create a new password. The reset link is valid for a limited time, so use it promptly.'
  },
  {
    category: 'login',
    question: 'How do I reset my password?',
    answer: 'To reset your password: (1) Click "Forgot password?" on the login page, (2) Enter your registered email address, (3) Check your email for the password reset link, (4) Click the link to open the reset password page, (5) Enter your new password (must meet security requirements: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character), (6) Confirm your new password, (7) Submit to complete the reset. You\'ll be redirected to the login page to sign in with your new password.'
  },
  {
    category: 'login',
    question: 'I didn\'t receive the password reset email. What should I do?',
    answer: 'If you don\'t receive the reset email: (1) Check your spam/junk folder, (2) Verify you entered the correct email address registered with your account, (3) Wait a few minutes as email delivery may be delayed, (4) Try requesting a new reset link, (5) If the problem persists, contact IT support at support@education.im.gov.ng with your registered email address.'
  },
  {
    category: 'login',
    question: 'How long is the password reset link valid?',
    answer: 'Password reset links are valid for a limited time (typically 1 hour) for security reasons. If your link has expired, simply request a new password reset link from the login page. You can request a new link as many times as needed.'
  },
  {
    category: 'dashboard',
    question: 'What can I do on the dashboard?',
    answer: 'The main dashboard shows statistics for your LGA including total schools, registered schools, and pending applications. You can view a list of all schools in your LGA with their codes. Click on any school to access their examination portals where you can apply for exams and manage student registrations.'
  },
  {
    category: 'dashboard',
    question: 'What do the different status badges mean?',
    answer: 'Status badges indicate your application progress: "Not Applied" (gray) - you haven\'t applied yet; "Pending" (yellow) - application under review; "Approved" (green) - you can register students; "Rejected" (red) - application denied; "Completed" (blue) - process finished; "Onboarded" (purple) - students registered.'
  },
  {
    category: 'dashboard',
    question: 'How do I access a school\'s examination portals?',
    answer: 'From your main dashboard, click on any school in the schools list. This will take you to that school\'s examination portal page where you can see all available exams (WAEC, BECE, UBEGPT, UBETMS, CESS, UBEAT, JSCBE, and BECE Resit) and their application status. Click on an exam card to apply or manage students.'
  },
  {
    category: 'dashboard',
    question: 'What is the complete workflow from login to completion?',
    answer: 'The complete workflow is: (1) Login with your email and password → (2) Dashboard: View all schools in your LGA → (3) School Selection: Click on a school to access exam portals → (4) Exam Selection: View application status for each exam on the exam card → (5) Exam Application: Submit application with required details → (6) Approval: Wait for Ministry approval (3-5 days). If rejected, you can reapply → (7) Purchase Points: Once approved, purchase points to spend on student onboarding (one point per student) → (8) Onboard Students: Use available points to onboard students, or purchase more points as needed → (9) Final Submit: Submit all onboarded students for review and confirmation by the Ministry → (10) Completed: Once confirmed, get a new button to view and download the onboarded student list and Certificate of Completion.'
  },
  {
    category: 'dashboard',
    question: 'How do I switch between different schools in my LGA?',
    answer: 'To switch schools: (1) Click "Back to Dashboard" in the header to return to your main LGA dashboard, (2) From the dashboard, click on any other school in your schools list, (3) You\'ll be taken to that school\'s exam portal page. You can manage multiple schools simultaneously - each school\'s data is kept separate and organized.'
  },
  {
    category: 'dashboard',
    question: 'What information is shown on my main dashboard?',
    answer: 'Your LGA dashboard displays: (1) Total number of schools in your LGA, (2) Number of schools with registered exams, (3) Total pending applications across all schools, (4) Complete list of schools with their codes, (5) Quick access to each school\'s exam portals, (6) Your AEE profile information (name, email, LGA). This gives you a complete overview of all examination activities in your LGA.'
  },
  {
    category: 'exams',
    question: 'How do I apply for an examination?',
    answer: 'Navigate to the school\'s examination portal page, then click on the exam card you want to apply for. Fill out the application form with required details: principal\'s name, phone number, school address, and total number of students. Your AEE email will be used automatically. Submit the form and wait for approval from the Ministry. You\'ll be notified via email once approved.'
  },
  {
    category: 'exams',
    question: 'What are the examination fees?',
    answer: 'Fees vary by exam (in Naira): WAEC (7,000/7,500 late), BECE (7,000/7,500 late), JSCBE (7,000/7,500 late), UBEGPT (5,000/5,500 late), UBEAT (5,000/5,500 late), CESS (3,000/3,500 late), UBETMS (3,000), BECE Resit (2,000). Late fees apply after the deadline.'
  },
  {
    category: 'exams',
    question: 'Can I apply for multiple exams at once?',
    answer: 'Yes! You can apply for as many examinations as relevant to your school. Each exam has its own application process and approval. Simply click on each exam card and submit separate applications.'
  },
  {
    category: 'exams',
    question: 'How long does exam approval take?',
    answer: 'Exam applications are typically reviewed within 3-5 business days. You\'ll receive an email notification once your application is approved or if additional information is needed. Check your dashboard regularly for status updates.'
  },
  {
    category: 'exams',
    question: 'What happens after my exam application is approved?',
    answer: 'Once approved, the exam status changes to "Approved" and you can register students. You\'ll see the student registration interface where you can add students individually or in bulk, edit student information, manage payments, and track onboarding status. You can also export student lists and view payment summaries.'
  },
  {
    category: 'exams',
    question: 'Can I edit my application after submission?',
    answer: 'No, applications cannot be edited after submission. If you need to make changes, contact the Ministry IT support immediately. The number of students specified in your application is final and cannot be changed after approval.'
  },
  {
    category: 'dashboard',
    question: 'How do I manage my AEE profile?',
    answer: 'Click on your profile dropdown in the header (top right) to access account settings. You can change your password via the "Change Password" option (requires your current password) or delete your account if needed. Your profile shows your email and LGA assignment. For password resets without knowing your current password, use the "Forgot password?" link on the login page.'
  },
  {
    category: 'exams',
    question: 'How do I register students for an approved exam?',
    answer: 'Once your exam application is approved, click on the exam card to access the student registration page. You can add students one by one using the "Add Student" button or enable "Quick Add Mode" for faster bulk entry. Fill in student name, gender, class, and exam year. Each student registration deducts points from your allocated quota.'
  },
  {
    category: 'exams',
    question: 'What are exam points and how does the points system work?',
    answer: 'The points system is the core mechanism for managing student onboarding: (1) After your exam application is approved, you must purchase points to onboard students, (2) Each point costs the exam fee (e.g., ₦7,000 for WAEC) and allows you to onboard one student, (3) You can purchase points in batches - buy some now and more later as needed, (4) One point = one student onboarding slot, (5) Points are consumed when you onboard a student with their details (name, gender, class, exam year), (6) You can track available points vs used points in the student registration interface, (7) Purchase more points anytime until you reach your approved student limit, (8) Once all students are onboarded, submit for final Ministry review and confirmation. This system ensures payment is made before students are officially registered for examinations.'
  },
  {
    category: 'exams',
    question: 'How do I make payments for student registrations?',
    answer: 'After registering students, click the "Make School Payment" button in the payment section. Select the number of students to pay for (up to your available points), review the cost summary including processing fees, and proceed to payment via Paystack. You\'ll be redirected back to the portal after payment completion.'
  },
  {
    category: 'exams',
    question: 'What payment methods are accepted?',
    answer: 'Payments are processed through Paystack, which accepts: (1) Debit/Credit cards (Mastercard, Visa, Verve), (2) Bank transfers, (3) USSD payments, (4) Mobile money. All payment methods are secure and PCI DSS compliant. Choose your preferred payment method during checkout.'
  },
  {
    category: 'exams',
    question: 'Can I pay for students in batches?',
    answer: 'Yes! You don\'t have to pay for all students at once. You can make multiple payments for different batches of students. For example, if you registered 100 students, you can pay for 30 now and 70 later. Each payment transaction will be tracked separately in your payment history.'
  },
  {
    category: 'exams',
    question: 'What happens after I make a payment?',
    answer: 'After successful payment: (1) You\'ll receive a payment confirmation on screen, (2) A receipt will be sent to your email, (3) The payment status in your dashboard will update to "Paid", (4) Paid students will be marked as ready for onboarding, (5) You can download payment receipts from the payment history section. The system automatically verifies payments with Paystack.'
  },
  {
    category: 'exams',
    question: 'What if my payment fails or is declined?',
    answer: 'If payment fails: (1) Check your card details and try again, (2) Ensure you have sufficient funds, (3) Try a different payment method, (4) Contact your bank if the issue persists, (5) The system will show an error message with details. Your student registrations remain saved and you can retry payment anytime. No points are deducted for failed payments.'
  },
  {
    category: 'exams',
    question: 'Can I get a refund if I paid by mistake?',
    answer: 'Refund requests must be submitted in writing to the Ministry of Primary and Secondary Education. Include your payment reference number, school details, and reason for refund. Refunds are processed on a case-by-case basis according to Ministry policy. Contact support@education.im.gov.ng for refund inquiries.'
  },
  {
    category: 'application-process',
    question: 'Can I change the number of students after my application is approved?',
    answer: 'No. The number of students you specify in your application is FINAL and CANNOT be changed after approval. This policy ensures accurate resource allocation for examination materials, proper venue arrangements, correct budgeting, and fair distribution of examination slots across all schools.'
  },
  {
    category: 'application-process',
    question: 'What happens during the application review process?',
    answer: 'Once you submit your application: (1) Your application will be reviewed by the Ministry of Education, (2) You will receive a notification via email regarding the approval status, (3) The review process typically takes 3-5 business days, (4) You can track your application status in your dashboard.'
  },
  {
    category: 'application-process',
    question: 'What should I do after my application is approved?',
    answer: 'Upon approval: (1) You will be allocated exam points based on the number of students you specified, (2) Click on the exam card to access the student registration page, (3) Register students using the provided interface - each registration deducts one point, (4) Make payment for registered students, (5) Complete student onboarding process.'
  },
  {
    category: 'application-process',
    question: 'What if I need to change the student count after approval?',
    answer: 'If you need to change the number of students after approval, you would need to formally write to the Ministry of Primary and Secondary Education. Please note that changes to the approved number of students are not permitted'
  },
  {
    category: 'application-process',
    question: 'What should I verify before submitting my application?',
    answer: 'Before submitting, verify that: (1) The student count is accurate and final, (2) The school information (principal name, address, phone) is correct and up-to-date, (3) You have the authority to submit this application on behalf of the school, (4) You understand the student count cannot be changed after approval.'
  },
  {
    category: 'application-process',
    question: 'What are my responsibilities as an AEE?',
    answer: 'As an AEE, you are responsible for: (1) Managing exam applications for all schools in your LGA, (2) Ensuring all information provided is accurate and truthful, (3) Coordinating with school principals before submitting applications, (4) Managing student registrations and payments for approved exams, (5) Keeping your contact information current for receiving notifications.'
  },
  {
    category: 'application-process',
    question: 'Where can I get help with my application?',
    answer: 'If you have questions or need clarification: (1) Review the FAQ section accessible from any page, (2) Contact the Ministry of Education support team at support@education.im.gov.ng, (3) Consult with school principals before submitting applications, (4) Do not submit if you are uncertain about any aspect of the application.'
  },
  {
    category: 'exams',
    question: 'Can I edit student information after registration?',
    answer: 'Yes, you can edit student information before payment and onboarding. Click the edit icon next to any student row, make your changes, and click save. Once a student is onboarded, their information cannot be modified through the portal.'
  },
  {
    category: 'exams',
    question: 'How do I navigate between schools and exams?',
    answer: 'Use the back navigation in the header: From an exam detail page, click "Back to Exams" to return to the school\'s exam list. From a school\'s exam list, click "Back to Dashboard" to return to your main LGA dashboard. The header always shows your current context (AEE profile or school information).'
  },
  {
    category: 'exams',
    question: 'What is the student onboarding process?',
    answer: 'Student onboarding happens after payment: (1) Register students with their details (name, gender, class, exam year), (2) Make payment for the registered students, (3) After payment verification, students are automatically onboarded, (4) Each onboarded student receives a unique Student ID, (5) You can view and export the list of onboarded students with their IDs, (6) Onboarded students are ready for the examination. The system tracks onboarding status for each student.'
  },
  {
    category: 'exams',
    question: 'Can I export student lists and payment records?',
    answer: 'Yes! The portal provides export functionality: (1) Export student lists to Excel/CSV with all student details and IDs, (2) Download payment receipts as PDF for each transaction, (3) Generate comprehensive reports showing registered vs paid vs onboarded students, (4) Export data includes student names, IDs, gender, class, exam year, and payment status. Use these exports for record-keeping and reporting to school principals.'
  },
  {
    category: 'exams',
    question: 'What happens if I encounter an error during application?',
    answer: 'If you see validation errors, carefully review all required fields: principal\'s name (minimum 3 characters), phone number (at least 10 digits), school address (minimum 10 characters), and number of students (must be greater than 0). Ensure all fields are properly filled before resubmitting.'
  },
  {
    category: 'technical',
    question: 'Is the portal mobile-friendly?',
    answer: 'Yes! The portal is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. You can access it from any device with an internet connection and a modern web browser.'
  },
  {
    category: 'technical',
    question: 'Which browsers are supported?',
    answer: 'The portal works best on modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. For the best experience, ensure your browser is updated to the latest version.'
  },
  {
    category: 'technical',
    question: 'What should I do if the page is not loading?',
    answer: 'First, check your internet connection. Try refreshing the page or clearing your browser cache. If the problem persists, try a different browser or device. Contact IT support if you continue experiencing issues.'
  },
  {
    category: 'technical',
    question: 'Can I access the portal offline?',
    answer: 'No, the portal requires an active internet connection to function. All data is stored securely on our servers and requires real-time communication. Ensure you have stable internet when using the portal.'
  },
  {
    category: 'security',
    question: 'Is my school\'s information secure?',
    answer: 'Absolutely! We use industry-standard security measures including JWT authentication, encrypted data transmission, and secure servers. Your school\'s information is protected and only accessible to authorized personnel.'
  },
  {
    category: 'security',
    question: 'How often should I change my password?',
    answer: 'We recommend changing your password every 3-6 months for security. You can change your password anytime from your profile settings by clicking on your profile dropdown and selecting "Change Password". Always use a strong password with at least 8 characters including uppercase letters, lowercase letters, numbers, and special characters (@$!%*?&). Never share your password with unauthorized individuals.'
  },
  {
    category: 'security',
    question: 'What are the password requirements?',
    answer: 'For security, your password must meet these requirements: (1) At least 8 characters long, (2) Contains at least one uppercase letter (A-Z), (3) Contains at least one lowercase letter (a-z), (4) Contains at least one number (0-9), (5) Contains at least one special character (@$!%*?&). These requirements ensure your account is protected against unauthorized access.'
  },
  {
    category: 'security',
    question: 'What if I suspect unauthorized access to my account?',
    answer: 'Immediately change your password using the "Change Password" option in your profile settings or use the "Forgot password?" link on the login page if you cannot access your account. Contact the Ministry IT support at support@education.im.gov.ng. Review recent activities on your dashboard and report any suspicious applications or changes. The IT team will investigate and secure your account.'
  },
  {
    category: 'security',
    question: 'Does the portal store payment information?',
    answer: 'No, we never store payment card details. All payments are processed through certified secure payment gateways (Paystack/Flutterwave) that comply with international security standards (PCI DSS).'
  }
]

export const categoryInfo: CategoryInfo = {
  registration: { title: 'School Registration', icon: IoSchoolOutline },
  login: { title: 'Login & Access', icon: IoFileTrayStackedOutline },
  dashboard: { title: 'Dashboard Navigation', icon: IoBookOutline },
  exams: { title: 'Examinations & Applications', icon: IoCashOutline },
  'application-process': { title: 'Application Process & Policies', icon: IoFileTrayStackedOutline },
  technical: { title: 'Technical Support', icon: IoBuildOutline },
  security: { title: 'Security & Privacy', icon: IoFileTrayStackedOutline }
}
