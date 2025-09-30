import SchoolRegistrationForm from '@/components/SchoolRegistrationForm'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ searchParams }: PageProps) {
    const { submitted } = await searchParams;
    const isSubmitted = submitted === 'true'

    if (isSubmitted) {
        return (
            <div className="min-h-screen grid place-items-center pt-16 bg-[#F3F3F3]">
                <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center absolute top-10 left-1/2 -translate-x-1/2">
                    <Image
                        src="/images/ministry-logo.png"
                        alt="logo"
                        width={40}
                        height={40}
                        className='object-contain'
                    />
                    <span className='sm:text-2xl text-xl font-bold max-md:block hidden'>
                        <abbr title="Imo State Ministry of Primary Education">IMMoE</abbr>
                    </span>
                    <span className='sm:text-2xl text-xl font-bold max-md:hidden block'>Imo State Ministry of Primary Education</span>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl mx-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Pending</h2>

                    <div className="mb-6">
                        <Image
                            src="/images/waec.png"
                            alt="logo"
                            width={40}
                            height={40}
                            className='object-contain mx-auto'
                        />
                    </div>

                    <p className="text-gray-600 mb-6">
                        Your registration is under review. You will be notified by email once approved.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <main className="py-8 gap-4 flex flex-col bg-[#F3F3F3]">
            <div className="flex max-md:flex-row flex-col max-md:mb-0 mb-5 justify-center gap-2 items-center">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={40}
                    height={40}
                    className='object-contain'
                />
                <span className='sm:text-2xl text-xl font-bold max-md:block hidden'>
                    <abbr title="Imo State Ministry of Primary Education">IMMoE</abbr>
                </span>
                <span className='sm:text-2xl text-xl font-bold max-md:hidden block'>Imo State Ministry of Primary Education</span>
            </div>
            <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8">
                <SchoolRegistrationForm />
            </div>
            <div className="w-full text-center px-4 text-sm text-black/80">
                Already registered your school? <Link href="/portal" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2">Login here</Link>
            </div>
        </main>
    )
}
