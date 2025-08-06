import Image from "next/image";
import Link from "next/link";

const news = [
  {
    title: "Commissioner Ikegwuoha Bans Corporal Punishment in All Public Schools",
    description: "Professor B.T.O. Ikegwuoha has officially banned physical punishment—including flogging, slapping, or kneeling—in all Imo State primary and secondary schools. Discipline is now enforced through wisdom, not violence. The directive was issued during a 2025 training workshop for public school principals. He warned that erring headteachers may face demotion. ",
    date: "April 13, 2025",
    image: "/images/commisioner.png",
  },
  {
    title: "Illicit Private Schools Shutdown: Licenses Revoked by Ministry",
    description: "The Ministry has revoked licenses of unlicensed private schools operating in residential apartments and housing estates. Parents have been advised to withdraw students from these schools and re-register them in approved public or private institutions. Monitoring teams have been deployed for enforcement. ",
    date: "July 6, 2025",
    image: "/images/class5.jpg",
  },
  {
    title: "Uniform Standards Enforced Across All Schools in Imo State",
    description: "Prof. Ikegwuoha mandated that all primary and secondary schools—public, private, and missionary—adhere strictly to government-approved curriculum, textbooks, public holidays, official closing hours, and resumption dates to ensure uniformity of educational standards statewide. ",
    date: "June 16, 2025",
    image: "/images/home1.jpg",
  },
];


export default function LatestNewsSection() {
  return (
    <section className="w-full py-12 px-4 flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">Latest News</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl justify-center mb-8">
        {news.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-full max-w-md p-0 overflow-hidden transition hover:shadow-md"
          >
            <div className="w-full h-64 relative">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover rounded-t-2xl"
                sizes="400px"
                priority={idx === 0}
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 tracking-tight uppercase">{item.title}</h3>
              <p className="text-gray-500 text-base mb-6">{item.description}</p>
              <div className="mt-auto font-bold text-black text-base">{item.date}</div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/news">
        <p className="bg-green-700 animate-bounce hover:bg-green-800 text-white font-semibold px-12 py-3 rounded text-lg transition-colors text-center block">See More</p>
      </Link>
    </section>
  );
} 