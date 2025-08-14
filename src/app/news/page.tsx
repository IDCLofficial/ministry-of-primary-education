'use client'

import NewsSidebar from "./NewsSidebar";
import NewsSearchBar from "./NewsSearchBar";
import NewsGrid from "./NewsGrid";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { getNewsList, NewsItem } from "./newsData";
import { TopHero } from "@/components/TopHero";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const news = await getNewsList(process.env.NEXT_PUBLIC_MINISTRY_ID);
        setNewsList(news);
      } catch (error) {
        console.error('Error loading news in component:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = selectedCategory
    ? newsList.filter((item) => item.category === selectedCategory)
    : newsList;

  if (loading) {
    return (
      <div className="bg-white">
        <TopHero
          ministryName="Quality Education is Our Priority"
          titleLabel="News"
        />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading news...</p>
        </div>
       
      </div>
    );
  }

  if (filteredNews.length === 0) {
    return (
      <div className="bg-white">
        <TopHero
          ministryName="Quality Education is Our Priority"
          titleLabel="News"
        />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-gray-500 text-5xl mb-4">📰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No News Available</h2>
          <p className="text-gray-600">There are currently no news articles to display. Please check back later.</p>
        </div>
        <CTASection
          heading="Join Us in Quality Education"
          subtext="Be part of our mission to improve the quality of education in Imo State."
          buttonLabel="Contact Us"
          buttonHref="/contact-us"
         />
                    
      <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
           <TopHero ministryName="Quality Education is Our Priority" titleLabel="News" />

      <NewsSearchBar newsList={newsList} />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 pb-16">
        <NewsSidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          newsList={newsList}
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
          heading="Join Us in Quality Education"
          subtext="Be part of our mission to improve the quality of education in Imo State."
          buttonLabel="Contact Us"
          buttonHref="/contact-us"
         />
                    
      <Footer />
    </div>
  );
}
