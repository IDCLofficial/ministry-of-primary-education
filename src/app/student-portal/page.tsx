'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FaFileLines, FaStarHalfStroke, FaThumbsUp } from 'react-icons/fa6'
import { FaCheckCircle, FaGrinStars, FaQuestionCircle, FaSpinner } from 'react-icons/fa'
import FAQ from './components/FAQ'
import Link from 'next/link'
import { IoHappy, IoHappyOutline } from 'react-icons/io5'

interface ExamType {
    id: string
    name: string
    fullName: string
    description: string
    available: boolean
    route: string
}

export default function StudentPortalLanding() {
    const router = useRouter()

    const examTypes: ExamType[] = [
        {
            id: 'bece',
            name: 'BECE',
            fullName: 'Basic Education Certificate Examination',
            description: 'See how you performed in all your subjects and download your official certificate',
            available: true,
            route: '/student-portal/bece'
        },
        {
            id: 'ubeat',
            name: 'UBEAT',
            fullName: 'Universal Basic Education Achievement Test',
            description: 'Check your scores and get your First School Leaving Certificate (FSLC)',
            available: true,
            route: '/student-portal/ubeat'
        },
        {
            id: 'common-entrance',
            name: 'Common Entrance',
            fullName: 'Common Entrance Examination',
            description: 'View your Common Entrance results for secondary school admission',
            available: false,
            route: '/student-portal/common-entrance'
        },
        {
            id: 'neco',
            name: 'NECO',
            fullName: 'National Examinations Council',
            description: 'Access your NECO SSCE results and download your statement of results',
            available: false,
            route: '/student-portal/neco'
        },
        {
            id: 'nabteb',
            name: 'NABTEB',
            fullName: 'National Business and Technical Examinations',
            description: 'Check your NABTEB results for technical and vocational subjects',
            available: false,
            route: '/student-portal/nabteb'
        },
        {
            id: 'jamb',
            name: 'JAMB',
            fullName: 'Joint Admissions and Matriculation Board',
            description: 'View your UTME scores and check university admission status',
            available: false,
            route: '/student-portal/jamb'
        }
    ]

    const handleExamSelect = (exam: ExamType) => {
        if (!exam.available) {
            toast('This examination portal will be available soon', {
                icon: <FaSpinner className="w-5 h-5 text-gray-600 animate-spin" />,
                duration: 2000
            })
            return
        }

        router.push(exam.route)
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white">
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
                                <span className="text-base font-bold text-gray-900 block">Student Portal</span>
                                <span className="text-xs text-gray-500">Ministry of Education</span>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                            <span className="text-green-600 text-lg"><IoHappyOutline className="w-5 h-5"/></span>
                            <span className="text-sm font-medium text-green-700">Welcome Back!</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
                <div className="max-w-3xl relative my-4">
                    {/* Friendly Decorative Element */}
                    <div className="absolute -top-6 right-3 hidden lg:block">
                        <div className="relative">
                            <div className="w-16 h-16 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center transform rotate-12">
                                <FaStarHalfStroke className="w-8 h-8 text-yellow-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <FaGrinStars className="w-8 h-8 text-yellow-500 animate-bounce" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                        Your Results Are Ready!
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Great job completing your exams! We&apos;re excited to share your results with you.
                    </p>
                    <p className="text-base text-gray-500">
                        Choose your exam below to get started
                    </p>
                </div>
            </section>

            {/* Exam Cards Section */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Select Your Exam</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose the exam you took this year</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {examTypes.map((exam) => (
                        <button
                            key={exam.id}
                            onClick={() => handleExamSelect(exam)}
                            disabled={!exam.available}
                            className={`
                                relative text-left p-6 rounded-2xl transition-all group cursor-pointer
                                ${exam.available
                                    ? 'bg-[#E8F5E9] hover:bg-[#DFF0E0] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-[#C8E6C9]'
                                    : 'bg-gray-50 border border-gray-200'
                                }
                                ${exam.available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed pointer-events-none'}
                            `}
                        >

                            {/* Title */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                                        <FaFileLines className="w-5 h-5 mr-1 text-gray-600" />
                                        <abbr title={exam.fullName} className="no-underline cursor-help">
                                            {exam.name}
                                        </abbr>
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 font-medium">
                                        {exam.fullName}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {exam.description}
                                    </p>
                                </div>
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`
                                    px-1 py-1 rounded-full text-xs font-semibold
                                    ${exam.available
                                            ? exam.available
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-600 text-white'
                                            : 'bg-gray-400 text-white'
                                        }
                                `}>
                                        {exam.available ? <span className="flex items-center gap-1"><FaCheckCircle className="w-4 h-4 text-white" /> Available</span> : <span className="flex items-center gap-1"><FaSpinner className="w-4 h-4 text-gray-600 animate-spin" /> Soon</span>}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                className={`
                                    w-full py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
                                    ${exam.available
                                        ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
                                        : 'bg-gray-600 hover:bg-gray-700 text-white active:scale-95'
                                    }
                                `}
                                disabled={!exam.available}
                            >
                                {exam.available ? 'View My Results →' : 'Coming Soon'}
                            </button>
                        </button>
                    ))}
                </div>

                {/* Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        More examinations will be added as they become available
                    </p>
                </div>
            </section>

            {/* Info Banner */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-linear-to-b from-white to-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xl"><FaQuestionCircle className="w-5 h-5 text-green-600" /></span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-green-900 mb-1">
                                    Need Your Exam Number?
                                </h3>
                                <p className="text-sm text-green-700">
                                    Your exam number was given to you by your school. Ask your teacher if you can&apos;t find it!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-b from-white to-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xl"><FaThumbsUp className="w-5 h-5 text-green-600" /></span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-green-900 mb-1">
                                    Well Done!
                                </h3>
                                <p className="text-sm text-green-700">
                                    You worked hard for these results. We&apos;re proud of your effort and dedication!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQ />

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 mt-auto bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-xs text-gray-500 text-center">
                        © {new Date().getFullYear()} <Link href="/" target="_blank" className="text-gray-500 hover:text-gray-700 hover:underline">Imo State Ministry of Primary and Secondary Education</Link>
                    </p>
                </div>
            </footer>
        </div>
    )
}
