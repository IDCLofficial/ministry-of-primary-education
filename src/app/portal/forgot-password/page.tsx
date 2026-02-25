import React from 'react'
import Image from 'next/image'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'
import HangingTree from '../components/HangingTree'
 
export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F3F3F3] relative">
            <HangingTree type='left' />
 
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
                <div className="max-w-md w-full mx-auto">
                    <ForgotPasswordForm />
                </div>
            </main>
        </div>
    )
}