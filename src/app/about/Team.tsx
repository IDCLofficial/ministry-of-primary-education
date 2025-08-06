import Image from "next/image";
import Link from "next/link";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface TeamPageProps {
  teamMembers: TeamMember[];
}

export default function TeamPage({ teamMembers }: TeamPageProps) {
  return (
    <section className="w-full min-h-screen bg-[#f4f8f9] py-16 flex flex-col items-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900">Our Team</h1>

      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl text-center shadow p-6 flex flex-col items-center w-[280px] border-2 border-transparent transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-green-600"
          >
            <div className="relative w-50 h-60 rounded-full overflow-hidden mb-4">
              <Image src={member.image} alt={member.name} fill className="object-cover" />
            </div>
            <h2 className="text-xl text-center font-semibold text-gray-900 mb-1">{member.name}</h2>
            <p className="text-green-700 font-medium mb-2">{member.role}</p>
            <p className="text-gray-700 text-sm mb-2 text-center">{member.bio}</p>
          </div>
        ))}
      </div>

      <Link href="/" className="px-7 py-3 bg-green-600 text-white rounded text-sm font-semibold shadow hover:bg-green-700 transition">
        Back to Home
      </Link>
    </section>
  );
}
