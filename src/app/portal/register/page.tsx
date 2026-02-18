import React from 'react'
import Image from 'next/image'
import RegistrationForm from '@/components/RegistrationForm'
import Link from 'next/link'
import HangingTree from '../components/HangingTree'

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F3F3F3] relative">
            <HangingTree type='right' />
            
            <header className="w-full pt-8 pb-6 px-4 relative z-20">
                <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center">
                    <Image
                        src="/images/ministry-logo.png"
                        alt="logo"
                        width={60}
                        height={60}
                        className='object-contain'
                        title='Imo State Ministry of Primary and Secondary Education logo'
                    />
                    <span className='sm:text-2xl text-xl text-center font-bold max-md:block hidden'>
                        <abbr title="Imo State Ministry of Primary and Secondary Education">MOPSE</abbr>
                    </span>
                    <span className='sm:text-2xl text-xl text-center font-bold max-md:hidden block'>Imo State Ministry of Primary and Secondary Education</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center gap-6 w-full px-4 sm:px-6 lg:px-8 pb-8 relative z-10">
                <div className="max-w-2xl w-full mx-auto">
                    <RegistrationForm />
                </div>
                <div className="w-full text-center text-sm text-black/80 space-y-2">
                    <div>
                        Already registered? <Link href="/portal" className="text-green-600 hover:text-green-800 transition-colors duration-200 underline underline-offset-2 font-medium">Login here</Link>
                    </div>
                    <div>
                        Need help? <Link href="/portal/faq" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2 font-medium">View FAQ & User Manual</Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
