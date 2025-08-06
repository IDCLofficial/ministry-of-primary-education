import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import Link from 'next/link';

interface AboutMandateSectionProps {
  label: string;
  title: string;
  subheading: string;
  description: string;
  buttonText: string;
  image1: string;
  image2: string;
}

export default function AboutMandateSection({
  label,
  title,
  subheading,
  description,
  buttonText,
  image1,
  image2,
}: AboutMandateSectionProps) {
  return (
<section className={`relative w-full p-8 py-20 bg-[url('/images/gradient.png')] bg-no-repeat bg-cover shadow-lg overflow-hidden`}>
      
      <div className="w-[94%] mx-auto">
        {/* top section */}
        <div className="px-3 animate-bounce py-2 mb-3 bg-white text-gray-900 rounded-full font-semibold text-sm shadow-lg w-fit">
          {label}
        </div>
        <div className="mb-16  mx-auto flex flex-col lg:flex-row justify-between gap-10 items-start">
          {/* Left Side */}
          <div className="flex-1 flex flex-col">
            <h2 className=" text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-2 lg:mb-8">
              {title}<br />
              {subheading}
            </h2>
          </div>
          {/* Right Side */}
          <div className="flex-1 flex flex-col justify-between h-full gap-12 items-start mt-2 sm:mt-4 lg:mt-8">
            <p className="text-white text-base lg:text-lg mb-6 leading-6">
              {description}
            </p>
            <Link href="/about" passHref>
              <button className="px-4 animate-pulse sm:px-6 py-2 bg-white text-gray-900 rounded font-semibold shadow hover:bg-gray-200 transition-all duration-200 w-32 sm:w-36 min-w-[120px] h-10 text-sm sm:text-base text-center flex items-center justify-center whitespace-nowrap transform hover:scale-105 hover:shadow-lg">
                {buttonText}
              </button>
            </Link>
          </div>
        </div>
        {/* BOTTOM SECTION */}
        <AnimatedSection delay={0.3} yOffset={100}>
          <div className="flex gap-4">
            <div className="relative w-full md:w-[680px] h-[260px] rounded-lg overflow-hidden group transition-all duration-300">
              <Image
                src={image1}
                alt="Mandate Image 1"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                priority
              />
              <span className="text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition duration-700 drop-shadow-md animate-fadeIn"></span>
              <div className="absolute inset-0 bg-black/60 flex items-end justify-center transition-all duration-300 group-hover:bg-black/40">
                <span className="text-gray-200 tracking-wide lg:tracking-[.75rem] text-xl font-semibold w-full px-4 pb-4">
                Raising a new generation of Leaders
                </span>
              </div>
            </div>
            <div className="relative w-[340px] h-[260px] rounded-lg overflow-hidden group transition-all duration-300">
              <Image
                src={image2}
                alt="Mandate Image 2"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                priority
              />
              <div className="absolute inset-0 bg-black/60 flex items-end justify-center transition-all duration-300 group-hover:bg-black/40">
              <span className="text-gray-200 tracking-wide lg:tracking-[.75rem] text-xl font-semibold w-full px-4 pb-4">
              Empowering Students
              </span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
