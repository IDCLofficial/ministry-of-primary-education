'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoArrowBack, IoSchoolOutline, IoBookOutline, IoFileTrayStackedOutline, IoCashOutline, IoBuildOutline, IoDownloadOutline } from 'react-icons/io5'
import { generateFAQPDF } from '../utils/pdfGenerator'
import { useRouter } from 'next/navigation'

interface FAQItem {
    question: string
    answer: string
    category: 'registration' | 'login' | 'dashboard' | 'exams' | 'technical' | 'security'
}

const allFAQs: FAQItem[] = [
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
    // {
    //     category: 'login',
    //     question: 'What should I do if I forgot my password?',
    //     answer: 'Click on the "Forgot Password" link on the login page (if available), or contact the Ministry IT support through your school administrator. They will help you reset your password securely.'
    // },
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
        answer: 'From the dashboard, click on the exam card you want to apply for. Fill out the application form with required details including estimated number of students. Submit the form and wait for approval from the Ministry. You\'ll be notified via email once approved.'
    },
    {
        category: 'exams',
        question: 'What are the examination fees?',
        answer: 'Fees vary by exam: WAEC (Naira 7,000/Naira 7,500 late), BECE (Naira 7,000/Naira 7,500 late), JSCBE (Naira 7,000/Naira 7,500 late), UBEGPT (Naira 5,000/Naira 5,500 late), UBEAT (Naira 5,000/Naira 5,500 late), CESS (Naira 3,000/Naira 3,500 late), UBETMS (Naira 3,000), BECE Resit (Naira 2,000). Late fees apply after the deadline.'
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

const categoryInfo = {
    registration: { title: 'School Registration', icon: IoSchoolOutline },
    login: { title: 'Login & Access', icon: IoFileTrayStackedOutline },
    dashboard: { title: 'Dashboard Navigation', icon: IoBookOutline },
    exams: { title: 'Examinations & Applications', icon: IoCashOutline },
    technical: { title: 'Technical Support', icon: IoBuildOutline },
    security: { title: 'Security & Privacy', icon: IoFileTrayStackedOutline }
}

export default function PortalFAQPage() {
    const router = useRouter(); 
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            await generateFAQPDF(allFAQs, categoryInfo)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/ministry-logo.png"
                                alt="MOPSE"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <div>
                                <span className="text-base sm:text-lg font-bold text-gray-900 block">Portal FAQ & User Manual</span>
                                <span className="text-xs text-gray-500">Ministry of Primary & Secondary Education</span>
                            </div>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <IoArrowBack className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Portal</span>
                        </button>
                    </div>
                </div>
            </header>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                <div className="mb-12 sm:mb-16">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <p className="text-white bg-green-600 px-4 py-2 rounded-full w-fit font-semibold text-xs sm:text-sm mb-4 tracking-wide uppercase">
                                Help Center
                            </p>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Portal FAQ & User Manual
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
                                Complete guide to using the MOPSE School Portal. Find answers to common questions about registration, login, dashboard navigation, and exam applications.
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl whitespace-nowrap self-start sm:self-auto cursor-pointer"
                        >
                            <IoDownloadOutline className="w-5 h-5" />
                            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>

                {Object.entries(categoryInfo).map(([category, info]) => {
                    const categoryFAQs = allFAQs.filter(faq => faq.category === category)
                    const Icon = info.icon
                    
                    return (
                        <div key={category} className="mb-12 sm:mb-16">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                {info.title}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryFAQs.map((faq) => {
                                    const globalIndex = allFAQs.indexOf(faq)
                                    
                                    return (
                                        <div key={globalIndex} className="space-y-3">
                                            <h3 className="text-base font-bold text-gray-900 leading-tight">
                                                {faq.question}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </section>

            <footer className="border-t border-gray-100 py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <p className="text-xs text-gray-500 text-center">
                        © {new Date().getFullYear()} <Link href="/" className="text-gray-500 hover:text-gray-700 hover:underline">Imo State Ministry of Primary and Secondary Education</Link>
                    </p>
                </div>
            </footer>
        </div>
    )
}
