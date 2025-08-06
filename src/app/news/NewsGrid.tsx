import Image from "next/image";
import Link from "next/link";

interface NewsItem {
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
}

interface NewsGridProps {
  news: NewsItem[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function NewsGrid({ news }: NewsGridProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((item, idx) => (
        <Link
          key={idx}
          href={`/news/${slugify(item.title)}`}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition cursor-pointer"
        >
          <div className="relative w-full h-48">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1 rounded font-semibold">Top News</span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{item.title}</h3>
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.description}</p>
            <span className="text-gray-500 text-xs mt-auto">{item.date}</span>
          </div>
        </Link>
      ))}
    </div>
  );
} 