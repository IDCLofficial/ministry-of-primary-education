'use client'

import React from 'react'
import Image from 'next/image'
import BeceLoginForm from './components/BeceLoginForm'

export default function BecePortalPage() {
    return (
        <div className="min-h-screen grid place-items-center grided bg-[#f6f2ea]">
            <div className='absolute h-full w-full inset-0 z-[0]'>
                <Image
                    src="/images/asset.png"
                    alt="logo"
                    fill
                    className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75]'
                    title='Imo State Ministry of Primary and Secondary Education logo'
                />
            </div>
            <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center absolute top-10 left-1/2 -translate-x-1/2">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={60}
                    height={60}
                    className='object-contain'
                    title='Imo State Ministry of Primary and Secondary Education logo'
                />

                <span className='sm:text-2xl text-xl font-bold max-md:block hidden'>
                    <abbr title="Ministry of Primary and Secondary Education">MOPSE</abbr> Portal
                </span>
                <span className='sm:text-2xl text-xl text-center font-bold max-md:hidden block'>Imo State Ministry of Primary and Secondary Education</span>
            </div>
            <main className="py-8 gap-4 flex flex-col w-full relative z-10">
                {/* Form Container */}
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-32">
                    <BeceLoginForm />
                </div>
            </main>
        </div>
    )
}