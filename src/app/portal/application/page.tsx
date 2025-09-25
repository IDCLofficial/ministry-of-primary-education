import SchoolRegistrationForm from '@/components/SchoolRegistrationForm'
import Image from 'next/image'
import Link from 'next/link'

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
            <div className="w-full text-center px-4 text-sm text-black/80">
                Already registered your school? <Link href="/portal" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2">Login here</Link>
            </div>
        </main>
    )
}
