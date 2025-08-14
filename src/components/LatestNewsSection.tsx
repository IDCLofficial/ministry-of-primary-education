import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { getNewsList } from "@/app/news/newsData";

export default async function LatestNewsSection() {
  // Fetch latest 3 news items
  const news = await getNewsList();
  const latestNews = news.slice(0, 3); // Show only the 3 most recent news items
  if (!latestNews || latestNews.length === 0) {
    return (
      <section className="w-full py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">Latest News</h2>
        <p className="text-gray-500 text-lg">No news available at the moment. Please check back later.</p>
      </section>
    );
  }

  return (
    <section className="w-full py-12 px-4 flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">Latest News</h2>
      <AnimatedSection> 
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl justify-center mb-8">
        {latestNews.map((item, idx) => (
          <Link
            key={idx}
            href={`/news/${item.slug}`}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-full max-w-md p-0 overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-full h-64 relative">
              <Image
                src={item.image || '/images/default.jpg'}
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
          </Link>
        ))}
      </div>
      </AnimatedSection>
      <Link href="/news">
        <button className="bg-green-700 animate-bounce hover:bg-green-800 text-white font-semibold px-12 py-3 rounded text-lg transition-colors">See More</button>
      </Link>
    </section>
  );
} 