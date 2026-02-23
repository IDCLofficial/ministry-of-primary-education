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
    question: 'Why am I being redirected to create a password?',
    answer: 'This happens on your first login. The system requires you to create a secure password to protect your school\'s account. Choose a strong password with at least 6 characters that you can remember.'
  },
  {
    category: 'login',
    question: 'Can multiple people use the same AEE account?',
    answer: 'Yes, but we recommend sharing credentials only with authorized education officials in your LGA. Each LGA has one AEE account, so coordinate with your colleagues to avoid conflicts when submitting applications or managing school data.'
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
    answer: 'Click on your profile dropdown in the header (top right) to access account settings. You can change your password via the "Change Password" option or delete your account if needed. Your profile shows your email and LGA assignment.'
  },
  {
    category: 'exams',
    question: 'How do I register students for an approved exam?',
    answer: 'Once your exam application is approved, click on the exam card to access the student registration page. You can add students one by one using the "Add Student" button or enable "Quick Add Mode" for faster bulk entry. Fill in student name, gender, class, and exam year. Each student registration deducts points from your allocated quota.'
  },
  {
    category: 'exams',
    question: 'What are exam points and how do they work?',
    answer: 'When your exam application is approved, you receive points equal to the number of students you specified. Each student you register consumes one point. You can see your available points vs total points in the student registration interface. Once points are exhausted, you cannot add more students.'
  },
  {
    category: 'exams',
    question: 'How do I make payments for student registrations?',
    answer: 'After registering students, click the "Make School Payment" button in the payment section. Select the number of students to pay for (up to your available points), review the cost summary including processing fees, and proceed to payment via Paystack. You\'ll be redirected back to the portal after payment completion.'
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
    answer: 'We recommend changing your password every 3-6 months for security. Always use a strong password with a mix of letters, numbers, and symbols. Never share your password with unauthorized individuals.'
  },
  {
    category: 'security',
    question: 'What if I suspect unauthorized access to my account?',
    answer: 'Immediately change your password and contact the Ministry IT support. Review recent activities on your dashboard and report any suspicious applications or changes. The IT team will investigate and secure your account.'
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
