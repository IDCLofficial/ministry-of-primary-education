import Image from "next/image";
import Link from "next/link";
import { NewsItem } from './newsData';

interface NewsSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  newsList: NewsItem[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function NewsSidebar({ selectedCategory, setSelectedCategory, newsList }: NewsSidebarProps) {
  // Extract unique categories from the news data
  const categories = Array.from(
    new Set(newsList.map((news: NewsItem) => news.category).filter(Boolean) as string[])
  ).map(categoryName => ({ name: categoryName }));
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">CATEGORIES</h3>
        <ul className="space-y-2">
          {categories.map((cat, idx) => {
            const count = newsList.filter(news => news.category === cat.name).length;
            const isActive = selectedCategory === cat.name;
            return (
              <li key={idx} className="flex justify-between text-gray-700 text-sm">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                  className={`flex justify-between w-full hover:text-green-700 transition-colors ${isActive ? 'font-bold text-green-700' : ''}`}
                >
                  <span>{cat.name}</span>
                  <span>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-4">LATEST NEWS</h3>
        <ul className="space-y-4">
          {newsList
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .map((news: NewsItem, idx: number) => (
            <li key={idx}>
               <Link
          key={idx}
          href={`/news/${slugify(news.title)}`}
          className="bg-white overflow-hidden flex flex-col hover:shadow-md transition cursor-pointer"
        >
              <div className="flex gap-3 items-center group hover:text-green-700 transition-colors w-full">
                <div className="w-20 h-14 relative rounded overflow-hidden">
                  <Image src={news.image} alt={news.title} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-green-700">{news.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{news.date}</div>
                </div>
              </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 