import React from 'react'
import Image from 'next/image'
import LoginForm from '@/components/LoginForm'
import Link from 'next/link'
import HangingTree from './components/HangingTree'

export default function PortalPage() {
    return (
        <div className="min-h-screen grid place-items-center bg-[#F3F3F3]">
            <HangingTree
                type='left'
            />
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
            <main className="py-8 gap-4 flex flex-col w-full relative z-10">
                {/* Header */}

                {/* Form Container */}
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <LoginForm />
                </div>
                {<div className="w-full text-center px-4 text-sm text-black/80">
                    Haven&apos;t registered your school? <Link href="/portal/application" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2">Apply here</Link>
                </div>}
            </main>
        </div>
    )
}
