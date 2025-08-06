import Image from "next/image";
import { newsList } from "./newsData";

interface NewsSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

const categories = [
  { name: "Latest Updates" },
  { name: "Policies" },
];

const popularNews = newsList;

export default function NewsSidebar({ selectedCategory, setSelectedCategory }: NewsSidebarProps) {
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
        <h3 className="font-bold text-lg mb-4">POPULAR NEWS</h3>
        <ul className="space-y-4">
          {popularNews.map((news, idx) => (
            <li key={idx}>
              <div className="flex gap-3 items-center group hover:text-green-700 transition-colors w-full">
                <div className="w-14 h-14 relative rounded overflow-hidden">
                  <Image src={news.image} alt={news.title} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-green-700">{news.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{news.date}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 