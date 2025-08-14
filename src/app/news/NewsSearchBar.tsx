'use client'

import { useState, useEffect } from "react";
import Link from "next/link";

import { NewsItem } from './newsData';

interface NewsSearchBarProps {
  newsList: NewsItem[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function NewsSearchBar({ newsList }: NewsSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(newsList);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions =
    query.length > 0
      ? newsList.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.toLowerCase();
    setResults(
      newsList.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    );
    setShowSuggestions(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setShowSuggestions(true);
  }

  function handleSuggestionClick(title: string) {
    setQuery(title);
    setShowSuggestions(false);
  }

  // Reset search when newsList changes
  useEffect(() => {
    setQuery("");
    setResults(newsList);
    setShowSuggestions(false);
  }, [newsList]);

  return (
    <div className="w-full flex flex-col items-center py-8 bg-white relative">
      <form className="flex w-full max-w-2xl" onSubmit={handleSearch} autoComplete="off">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search"
            className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none w-full"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b shadow z-10 max-h-48 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleSuggestionClick(item.title)}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-8 py-2 rounded-r font-semibold"
        >
          Search
        </button>
      </form>
      {query.length > 0 && results.length > 0 && (
        <div className="w-full max-w-2xl mt-4">
          {results.map((item, idx) => (
            <Link key={idx} href={`/news/${slugify(item.title)}`} className="block border-b py-3 hover:bg-gray-50 transition">
              <div className="font-bold">{item.title}</div>
              <div className="text-xs text-gray-500 mb-1">{item.date}</div>
              <div className="text-sm text-gray-700 line-clamp-2">{item.description}</div>
            </Link>
          ))}
        </div>
      )}
      {query.length > 0 && results.length === 0 && (
        <div className="w-full max-w-2xl mt-4 text-center text-gray-500">No news found.</div>
      )}
    </div>
  );
} 