'use client'
import Image from "next/image";

const partners = [
  { src: "/images/imshia.jpg", alt: "imshia" },
  { src: "/images/unicef.jpeg", alt: "unicef" },
  { src: "/images/imsubeb.jpg", alt: "imsubeb" },
  { src: "/images/monsm-news2.webp", alt: "monsm-news2" },
  { src: "/images/nnpc.png", alt: "nnpc" },
  { src: "/images/civil.png", alt: "civil" },
  { src: "/images/imsubeb.jpg", alt: "imsubeb" },
];

export default function FeaturedPartners() {
  return (
    <section className="w-full py-20 bg-[#f7f9fa]">
      <h2 className="text-3xl md:text-[43px] font-medium text-center mb-10">Featured Partners</h2>

      <div className="overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-scroll">
          {partners.concat(partners).map((partner, idx) => (
            <div key={idx} className="inline-block mx-8">
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center w-[150px] h-[80px]">
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
