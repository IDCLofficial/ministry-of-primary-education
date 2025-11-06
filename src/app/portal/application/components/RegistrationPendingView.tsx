'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistrationPendingView() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(5)

    // Redirect countdown effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    // Use setTimeout to move navigation outside of state update
                    setTimeout(() => {
                        router.replace('/portal')
                    }, 0)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    return (
        <div className="min-h-screen grid place-items-center pt-16 bg-[#F3F3F3]">
            <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center absolute top-10 left-1/2 -translate-x-1/2">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={40}
                    height={40}
                    className='object-contain'
                    title='Imo State Ministry of Primary and Secondary Education logo'
                />
                <span className='sm:text-2xl text-xl text-center font-bold max-md:block hidden'>
                    <abbr title="Imo State Ministry of Primary and Secondary Education">MOPSE</abbr>
                </span>
                <span className='sm:text-2xl text-xl text-center font-bold max-md:hidden block'>Imo State Ministry of Primary and Secondary Education</span>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl mx-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Pending</h2>

                <div className="mb-6">
                    <Image
                        src="/images/waec.png"
                        alt="WAEC logo"
                        width={40}
                        height={40}
                        className='object-contain mx-auto'
                        title='West African Examinations Council logo'
                    />
                </div>

                <p className="text-gray-600 mb-6">
                    Your registration is under review. You will be notified by email once approved.
                </p>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Redirecting back to application page in <span className="font-bold text-blue-600">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
                    </p>
                    <button
                        onClick={() => router.push('/portal/application')}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm transition-colors duration-200"
                    >
                        Go back now
                    </button>
                </div>
            </div>
        </div>
    )
}
