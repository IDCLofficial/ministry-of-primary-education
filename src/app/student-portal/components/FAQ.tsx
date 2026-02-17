'use client'
import Link from 'next/link'
import React from 'react'
import { IoArrowForward } from 'react-icons/io5'

interface FAQItem {
    question: string
    answer: string
}

const faqData: FAQItem[] = [
    {
        question: 'How do I find my exam number?',
        answer: 'Your exam number was provided by your school when you registered. It\'s on your exam slip or registration form. If you can\'t find it, ask your class teacher.'
    },
    {
        question: 'What if I forgot my exam number?',
        answer: 'For UBEAT, you can use the alternative login by clicking "Don\'t know your exam number?" and providing your name, school, and LGA. For BECE, contact your school to retrieve it.'
    },
    {
        question: 'Why can\'t I see my results?',
        answer: 'Check your exam number format is correct. Your results might not be uploaded yet. For BECE, ensure payment is complete.'
    },
    {
        question: 'Do I need to pay to access my results?',
        answer: 'Yes, both BECE and UBEAT require a one-time payment to access your results. After payment is confirmed, you can view, download, and print your results unlimited times.'
    },
    {
        question: 'Can I download my results?',
        answer: 'Yes! Once you access your dashboard, you\'ll find "Download" and "Print" buttons. You can save a PDF copy anytime you log back in.'
    },
    {
        question: 'What format should my exam number be?',
        answer: 'BECE accepts: XX/000/000, XX/000/0000/000, or XX/XX/000/0000 (e.g., ok/977/2025 or ok/977/2025/001). Use lowercase letters and include all forward slashes.'
    }
]

export default function FAQ() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            {/* Header */}
            <div className="mb-16">
                <p className="text-white bg-green-600 px-4 py-2 rounded-full w-fit font-semibold text-sm mb-4 tracking-wide uppercase">FAQ</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl">
                    Find answers to common questions about accessing your examination results.
                    We&apos;re here to make your experience as smooth as possible.
                </p>
            </div>

            {/* FAQ Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                {faqData.map((faq, index) => (
                    <div key={index} className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {faq.question}
                        </h3>
                        <p className="text-base text-gray-500 leading-relaxed">
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>

            {/* Still Have Questions */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                        Still have questions?
                    </h3>
                    <p className="text-gray-600 text-base">
                        We understand. Check more FAQs below or ask your school or parents.
                    </p>
                </div>
                <Link
                    href="/student-portal/faq"
                    className="inline-flex text-sm items-center gap-2 px-4 py-2 w-full md:w-fit justify-center bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer group shadow-[0_4px_rgba(0,0,0,0.25)] active:shadow-[0_0px_rgba(0,0,0,1)] active:translate-y-2"
                >
                    View All FAQs
                    <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    )
}
