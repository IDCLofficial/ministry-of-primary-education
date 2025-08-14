"use client";

import React, { useState, useEffect } from "react";
import MediaHeroSection from "./MediaHeroSection";
import MediaGalleryGrid from "./MediaGalleryGrid";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import MediaSearchBar from "./MediaSearchBar";
import { fetchMediaData } from "./mediaData";

interface MediaItem {
  image: string;
  title: string;
  isVideo: boolean;
}

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMediaData(process.env.NEXT_PUBLIC_MINISTRY_ID);
        setMediaItems(data);
      } catch (err) {
        console.error('Failed to load media:', err);
        setError('Failed to load media. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();
  }, []);

  const filteredItems = mediaItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen w-full bg-[#F7F9FA] flex flex-col">
      <MediaHeroSection
        title="Watch Us"
        subtitle="Explore our gallery of photos, videos, and press releases showcasing our activities in Imo State."
        backgroundImage="/images/gradient.png"
        searchBar={<MediaSearchBar placeholder="Search media..." onSearch={setSearch} />}
      />
      
      <section className="w-full max-w-7xl mx-auto py-12 px-4">
        <div className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading media...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-5xl mb-4">
                {search ? '🔍' : '📷'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {search ? 'No results found' : 'No media available'}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {search 
                  ? 'We couldn\'t find any media matching your search. Try different keywords.'
                  : 'There are currently no media items to display. Please check back later.'}
              </p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <MediaGalleryGrid items={filteredItems} />
          )}
        </div>
      </section>
      <CTASection
        heading="Join Us"
        subtext="Be part of our mission"
        buttonLabel="Contact Us"
        buttonHref="/contact-us"
      />
      <Footer />
    </main>
  );
}
