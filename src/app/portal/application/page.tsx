import Image from 'next/image'
import Link from 'next/link'
import SchoolRegistrationForm from '../../../components/SchoolRegistrationForm'
import RegistrationPendingView from './components/RegistrationPendingView'

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ searchParams }: PageProps) {
    const { submitted } = await searchParams
    const isSubmitted = submitted === 'true'

    if (isSubmitted) {
        return <RegistrationPendingView />
    }

    return (
        <main className="py-8 gap-4 h-screen flex flex-col bg-[#F3F3F3]">
            <div className='absolute h-full w-full inset-0 z-[0]'>
                <Image
                    src="/images/asset.png"
                    alt="logo"
                    fill
                    className='object-cover hue-rotate-[0deg] saturate-200 brightness-[0.75]'
                    title='Imo State Ministry of Primary Education logo'
                />
            </div>
            <div className="flex max-md:flex-row flex-col max-md:mb-0 mb-5 justify-center gap-2 items-center">
                <Image
                    src="/images/ministry-logo.png"
                    alt="logo"
                    width={40}

                    height={40}
                    className='object-contain'
                    title='Imo State Ministry of Primary Education logo'
                />
                <span className='sm:text-2xl text-xl font-bold max-md:block hidden'>
                    <abbr title="Imo State Ministry of Primary Education">IMMoE</abbr>
                </span>
                <span className='sm:text-2xl text-xl font-bold max-md:hidden block'>Imo State Ministry of Primary Education</span>
            </div>
            <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
                <SchoolRegistrationForm />
            </div>
            <div className="w-full text-center px-4 text-sm text-black/80">
                Already registered your school? <Link href="/portal" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline underline-offset-2">Login here</Link>
            </div>
        </main>
    )
}
