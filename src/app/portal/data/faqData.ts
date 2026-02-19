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
    question: 'How do I register my school on the portal?',
    answer: 'Navigate to the registration page from the login screen. Select your LGA from the dropdown, then select your school name. Fill in your school address, principal name, contact email, and phone number. After submission, you\'ll receive login credentials via email within 24 hours.'
  },
  {
    category: 'registration',
    question: 'What if my school is not listed in the dropdown?',
    answer: 'If your school is not listed, please contact the Ministry of Primary and Secondary Education IT department. They will verify your school\'s information and add it to the system. You can reach them through your LGA education office.'
  },
  {
    category: 'registration',
    question: 'Can I register multiple times?',
    answer: 'No, each school can only register once. If your school already has an account, the system will notify you during registration. Contact your school administrator or the Ministry if you need to recover existing login credentials.'
  },
  {
    category: 'registration',
    question: 'What information do I need to register?',
    answer: 'You need: Your school\'s LGA, official school name, complete school address, principal\'s full name, a valid contact email address, and a working phone number (10-15 digits). Ensure all information is accurate as it will be used for official communications.'
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
    question: 'Can multiple people use the same school account?',
    answer: 'Yes, but we recommend sharing credentials only with authorized school staff. Each school has one account, so coordinate with your colleagues to avoid conflicts when submitting applications or managing student data.'
  },
  {
    category: 'dashboard',
    question: 'What can I do on the dashboard?',
    answer: 'The dashboard displays all available examinations (WAEC, BECE, UBEGPT, UBETMS, CESS, UBEAT, JSCBE, and BECE Resit). You can view exam details, check application status, apply for exams, and manage student registrations for approved exams.'
  },
  {
    category: 'dashboard',
    question: 'What do the different status badges mean?',
    answer: 'Status badges indicate your application progress: "Not Applied" (gray) - you haven\'t applied yet; "Pending" (yellow) - application under review; "Approved" (green) - you can register students; "Rejected" (red) - application denied; "Completed" (blue) - process finished; "Onboarded" (purple) - students registered.'
  },
  {
    category: 'dashboard',
    question: 'How do I view my school information?',
    answer: 'Your school name and status are displayed in the dashboard header. Click on your school name or profile section to view complete details including address, contact information, and registered exams.'
  },
  {
    category: 'exams',
    question: 'How do I apply for an examination?',
    answer: 'From the dashboard, click on the exam card you want to apply for. Fill out the application form with required details including total number of students. Submit the form and wait for approval from the Ministry. You\'ll be notified via email once approved.'
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
    answer: 'Once approved, you can proceed to register your students for the exam. The exam card status will change to "Approved" and you\'ll have access to the student registration portal where you can upload student information and make payments.'
  },
  {
    category: 'exams',
    question: 'Can I edit my application after submission?',
    answer: 'No, applications cannot be edited after submission. If you need to make changes, contact the Ministry IT support immediately. For approved applications, you can update student numbers during the registration phase.'
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
    answer: 'Upon approval: (1) You will be allocated exam points based on the number of students, (2) Each student registration will deduct points from your allocation, (3) You must register the exact number of students specified in your application, (4) Unused points cannot be transferred or refunded.'
  },
  {
    category: 'application-process',
    question: 'What if I need to change the student count after approval?',
    answer: 'If you need to change the number of students after approval, you would need to formally write to the Ministry of Primary and Secondary Education. Please note that changes to the approved number of students are not permitted'
  },
  {
    category: 'application-process',
    question: 'What should I verify before submitting my application?',
    answer: 'Before submitting, verify that: (1) The student count is accurate and final, (2) Your school information is correct and up-to-date, (3) You have the authority to submit this application on behalf of your school, (4) You understand the implications of the student count being unchangeable.'
  },
  {
    category: 'application-process',
    question: 'What are my responsibilities regarding application data?',
    answer: 'You are responsible for ensuring that: (1) All information provided is accurate and truthful, (2) The student count reflects your actual registration needs, (3) Your contact information is current for receiving notifications, (4) You have consulted with relevant school authorities before submission.'
  },
  {
    category: 'application-process',
    question: 'Where can I get help with my application?',
    answer: 'If you have questions or need clarification: (1) Review the FAQ section in your dashboard, (2) Contact the Ministry of Education support team at support@education.im.gov.ng, (3) Consult with your school administrator before submitting, (4) Do not submit if you are uncertain about any aspect of the application.'
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
