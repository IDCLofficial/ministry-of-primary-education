import SchoolRegistrationForm from '@/components/SchoolRegistrationForm'
import Image from 'next/image'

export default function page() {
    return (
        <main className="py-8 gap-4 flex flex-col bg-[#F3F3F3]">
            <div className="flex justify-center gap-2 items-center">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={40}
                    height={40}
                    className='object-contain'
                />
                <span className='sm:text-2xl text-xl font-bold'>IMMoE</span>
            </div>
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                <SchoolRegistrationForm />
            </div>
        </main>
    )
}
