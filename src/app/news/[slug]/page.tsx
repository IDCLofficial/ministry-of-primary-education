import Image from "next/image";
import NewsHeroSection from "./NewsHeroSection";
import NewsBodySection from "./NewsBodySection";
import Footer from "@/components/Footer";

const latestNews = [
  {
    title: "Imo Shuts Down Unauthorized Private Schools in Residential Apartments",
    date: "9 July 2025",
    img: "/images/imoschool2.png",
  },
];

export default function NewsDetailPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Section 1: Hero + Body */}
      <section className="relative w-full pb-[180px]">
        <NewsHeroSection />
        <NewsBodySection>
          {/* Title & Meta */}
          <div className="relative z-10 w-full flex justify-center pb-2">
            <div className="w-full max-w-3xl rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/imoschool2.png"
                alt="Private Schools Closure"
                width={900}
                height={400}
                className="object-cover w-full h-[260px] md:h-[320px]"
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Imo Shuts Down Unauthorized Private Schools in Residential Apartments
            </h1>
            <p className="text-gray-500 text-sm">9 July 2025 • Education Policy</p>
          </div>

          {/* Main Content */}
          <div>
            <p className="text-gray-700 mb-6">
              The Imo State Ministry of Primary and Secondary Education has taken decisive action by revoking licenses and approvals of private schools operating in residential apartments and non-designated housing estates across the state.
            </p>
            <p className="text-gray-700 mb-6">
              The Ministry declared that such schools pose safety risks and fail to meet the minimum standards set for approved learning environments. Parents have been strongly advised to re-enroll their children in officially sanctioned institutions to ensure quality education and student welfare.
            </p>

            <div className="w-full flex justify-center my-8">
              <div className="w-full max-w-md rounded-xl overflow-hidden">
                <Image
                  src="/images/school2.jpg"
                  alt="Ministry Education Enforcement"
                  width={600}
                  height={300}
                  className="object-cover w-full h-64"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h2 className="font-semibold mb-2">Key Highlights:</h2>
                <ul className="list-disc ml-6 text-gray-700 mb-6">
                  <li>Closure of schools in residential and unapproved locations.</li>
                  <li>Permanent withdrawal of licenses for defaulting institutions.</li>
                  <li>Advisory to parents on verifying approved school lists.</li>
                  <li>Ministry urges compliance with education regulations.</li>
                  <li>State government prioritizing child safety and academic quality.</li>
                </ul>
              </div>
              <div className="flex-1 flex items-center">
                <blockquote className="border-l-4 border-red-600 pl-4 italic text-gray-800">
                  <span className="font-bold">
                    &ldquo;We cannot compromise the safety and future of our children by allowing substandard institutions to thrive under our watch.&rdquo;
                  </span>
                </blockquote>
              </div>
            </div>

            <p className="text-gray-700 mt-6">
              The Ministry has reiterated its commitment to monitoring compliance and working closely with education stakeholders to raise the standard of learning in the state. This move is part of a broader reform to sanitize the sector and restore public confidence in private education delivery.
            </p>
            <p className="text-gray-700 mt-2">
              A dedicated task force has been deployed to enforce these measures and conduct ongoing inspections of school facilities across all local government areas.
            </p>
          </div>
        </NewsBodySection>
      </section>

      {/* Section 2: Latest News */}
      <div className="w-full bg-[#181c23] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-white text-xl font-semibold mb-6">LATEST NEWS</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {latestNews.map((item, idx) => (
              <div key={idx} className="bg-[#232323] rounded-xl overflow-hidden flex-1 min-w-[220px] max-w-xs">
                <div className="relative w-full h-28">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-white text-xs font-semibold mb-2 line-clamp-2">{item.title}</div>
                  <div className="text-gray-400 text-[10px]">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Footer */}
      <Footer/>
    </div>
  );
}
