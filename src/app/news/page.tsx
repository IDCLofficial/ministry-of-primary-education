'use client'

import NewsSidebar from "./NewsSidebar";
import NewsSearchBar from "./NewsSearchBar";
import NewsGrid from "./NewsGrid";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useState } from "react";
import { newsList } from "./newsData";
import { TopHero } from "@/components/TopHero";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredNews = selectedCategory
    ? newsList.filter((item) => item.category === selectedCategory)
    : newsList;

  return (
    <div className="bg-white">
      <TopHero
ministryName="Raising Champions in Imo State"
titleLabel="News"
      />
      <NewsSearchBar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 pb-16">
        <NewsSidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <div className="flex-1">
          {selectedCategory && (
            <div className="mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex cursor-pointer items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go back to all news
              </button>
              <div className="mt-2 text-sm text-gray-600">
                Showing {filteredNews.length} news in &ldquo;{selectedCategory}&rdquo;
              </div>
            </div>
          )}
          <NewsGrid news={filteredNews} />
        </div>
      </div>
      <CTASection
  heading="Support Quality Education for Every Child in Imo"
  subtext="Join us in shaping a brighter future through inclusive, safe, and accessible education for all learners across the state."
  buttonLabel="Contact Us"
  buttonHref="/contact-us"
/>
                    
      <Footer />
    </div>
  );
}
