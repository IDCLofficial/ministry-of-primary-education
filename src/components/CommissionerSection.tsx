import Image from 'next/image';
import Link from 'next/link';

interface CommissionerSectionProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  bio: string;
  details: string;
}

export default function CommissionerSection({
  imageSrc,
  imageAlt,
  title,
  bio,
  details,
}: CommissionerSectionProps) {
  return (
    <section className="w-full bg-[#f3f8fa] py-20 px-4 md:px-0 flex justify-center">
        {/* <div className="flex flex-col md:flex-row items-center gap-18 w-full px-4 px-[3rem]"> */}
    {/* // <section className="w-full bg-[#f4f8f9] h-screen md:h-[80vh] py-16 flex justify-center"> */}
     <div className="w-[94%] max-w-6xl mx-auto flex flex-col md:flex-row items-stretch gap-16">
        {/* Image */}
        <div className="flex-shrink-0 flex items-stretch">
          <div className="relative w-[90vw] md:w-[380px] h-full min-h-[296px] md:min-h-0 md:h-full rounded-2xl overflow-hidden bg-white shadow flex-1">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col md:items-start px-2 w-full">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-[#777777] text-base md:text-lg mb-4 mt-4">
            {bio}
          </p>
          <br />
          <p className="text-[#777777] text-base md:text-lg mb-6">
            {details}
          </p>
          <Link href="/services" className="px-7 py-3 bg-green-600 text-white rounded text-sm font-semibold shadow hover:bg-green-700 transition">
            <button>
              What we Do
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
