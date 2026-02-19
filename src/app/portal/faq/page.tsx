'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoArrowBack, IoDownloadOutline } from 'react-icons/io5'
import { generateFAQPDF } from '../utils/pdfGenerator'
import { useRouter } from 'next/navigation'
import { allFAQs, categoryInfo } from '../data/faqData'

export default function PortalFAQPage() {
    const router = useRouter(); 
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            await generateFAQPDF()
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
