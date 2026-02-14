'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoArrowBack, IoSchoolOutline, IoPeopleOutline, IoBookOutline, IoFileTrayStackedOutline, IoCashOutline, IoBuildOutline } from 'react-icons/io5'

interface FAQItem {
    question: string
    answer: string
    category: 'general' | 'technical' | 'payment' | 'results'
}

const allFAQs: FAQItem[] = [
    {
        category: 'general',
        question: 'How do I find my exam number?',
        answer: 'Your exam number was provided by your school when you registered for the examination. It\'s usually on your exam slip or registration form. If you can\'t find it, ask your class teacher or go to your school\'s administrative office for assistance.'
    },
    {
        category: 'general',
        question: 'What if I forgot my exam number?',
        answer: 'Don\'t worry! For UBEAT, you can use the alternative login method by clicking "Don\'t know your exam number?" on the login page. You\'ll need to provide your full name, school name, LGA, and exam year. For BECE, please contact your school to retrieve your exam number.'
    },
    {
        category: 'results',
        question: 'Why can\'t I see my results?',
        answer: 'There could be several reasons: 1) Your exam number might be incorrect - double-check the format (e.g., ok/977/2025/001), 2) Your results might not be uploaded yet - check with your school, 3) For BECE, you may need to complete payment first.'
    },
    {
        category: 'results',
        question: 'When will my results be available?',
        answer: 'Results are typically available 2-4 weeks after the examination. Your school will notify you when results are ready to be checked. If it\'s been longer than this period, please contact your school administration for updates.'
    },
    {
        category: 'payment',
        question: 'Do I need to pay to see my BECE results?',
        answer: 'Yes, there is a one-time payment required to access BECE results. After logging in with your exam number, you\'ll be directed to a secure payment page. Once payment is confirmed, you can view, download, and print your results anytime.'
    },
    {
        category: 'payment',
        question: 'How much does it cost to access UBEAT results?',
        answer: 'If you have your exam number, UBEAT results are FREE! However, if you don\'t have your exam number and use the alternative login method (name, school, LGA), there\'s a ₦500 service fee to help us search for your records.'
    },
    {
        category: 'payment',
        question: 'What payment methods are accepted?',
        answer: 'We accept multiple payment methods including debit cards (Visa, Mastercard, Verve), bank transfers, and USSD codes. All payments are processed through secure payment gateways with 256-bit encryption.'
    },
    {
        category: 'payment',
        question: 'Is my payment information safe?',
        answer: 'Absolutely! We take security very seriously. All payments are processed through certified payment gateways (Paystack/Flutterwave) that comply with international security standards. We never store your card details.'
    },
    {
        category: 'technical',
        question: 'Can I download or print my results?',
        answer: 'Yes! Once you access your results dashboard, you\'ll find "Download" and "Print" buttons at the top of the page. You can save a PDF copy for your records or print a physical copy.'
    },
    {
        category: 'technical',
        question: 'What format should my exam number be in?',
        answer: 'BECE exam numbers typically follow this format: XX/XXX/XXXX/XXX (e.g., ok/977/2025/001). UBEAT exam numbers may vary slightly. The system will validate your format as you type.'
    },
    {
        category: 'technical',
        question: 'Can I access my results on my phone?',
        answer: 'Yes! The student portal is fully mobile-friendly and works on smartphones, tablets, and computers. You can access it from any device with an internet connection and a web browser.'
    },
    {
        category: 'technical',
        question: 'I\'m having trouble logging in. What should I do?',
        answer: 'First, check your internet connection. Then verify your exam number is correct. Clear your browser cache or try a different browser. If problems persist, try the alternative login method or contact support.'
    },
    {
        category: 'results',
        question: 'How many times can I view my results?',
        answer: 'Unlimited! Once you\'ve paid (for BECE) or logged in successfully, you can view your results as many times as you want. Just use the same exam number to log back in.'
    },
    {
        category: 'results',
        question: 'What if I see an error in my results?',
        answer: 'If you notice any errors or discrepancies in your results, please contact your school immediately. They will initiate the verification process with the examination board.'
    },
    {
        category: 'general',
        question: 'Who can I contact for more help?',
        answer: 'For technical issues, contact your school\'s ICT coordinator. For exam-related queries, speak with your principal or class teacher. You can also reach out to the Ministry through your school administration.'
    },
    {
        category: 'general',
        question: 'Is my personal information secure?',
        answer: 'Yes, we take data privacy seriously. Your personal information and results are encrypted and stored securely. We only share your information with authorized personnel and never sell your data.'
    }
]

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/ministry-logo.png"
                                alt="MOPSE"
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                            <div>
                                <span className="text-base font-bold text-gray-900 block">Student Portal FAQ</span>
                                <span className="text-xs text-gray-500">Ministry of Education</span>
                            </div>
                        </div>
                        <Link
                            href="/student-portal"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <IoArrowBack className="w-4 h-4" />
                            Back to Portal
                        </Link>
                    </div>
                </div>
            </header>

            {/* FAQ Content */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                {/* Header */}
                <div className="mb-16">
                    <p className="text-white bg-green-600 px-4 py-2 rounded-full w-fit font-semibold text-sm mb-4 tracking-wide uppercase">FAQ</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Find answers to common questions about accessing your examination results.
                        We&apos;re here to make your experience as smooth as possible.
                    </p>
                </div>

                {/* General Questions */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"><IoBookOutline className="w-6 h-6" /> General Questions</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allFAQs.filter(faq => faq.category === 'general').map((faq, index) => (
                            <div key={index} className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {faq.question}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Questions */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"><IoFileTrayStackedOutline className="w-6 h-6" /> Results & Access</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allFAQs.filter(faq => faq.category === 'results').map((faq, index) => (
                            <div key={index} className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {faq.question}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Questions */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"><IoCashOutline className="w-6 h-6" /> Payment & Fees</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allFAQs.filter(faq => faq.category === 'payment').map((faq, index) => (
                            <div key={index} className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {faq.question}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Questions */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"><IoBuildOutline className="w-6 h-6" /> Technical Support</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allFAQs.filter(faq => faq.category === 'technical').map((faq, index) => (
                            <div key={index} className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {faq.question}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Still Have Questions */}
                <div className="bg-gray-50 rounded-3xl p-12 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        Still have questions?
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <div className="flex items-center gap-2 text-gray-700">
                            <IoSchoolOutline className="w-6 h-6 text-green-600" />
                            <span className="text-base font-medium">Ask Your School</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <IoPeopleOutline className="w-6 h-6 text-green-600" />
                            <span className="text-base font-medium">Ask Your Parents</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-xs text-gray-500 text-center">
                        © {new Date().getFullYear()} Imo State Ministry of Primary and Secondary Education
                    </p>
                </div>
            </footer>
        </div>
    )
}

