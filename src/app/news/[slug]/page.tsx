'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import NewsHeroSection from "./NewsHeroSection";
import NewsBodySection from "./NewsBodySection";
import Link from "next/link";
import { getNewsList } from '../newsData';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';

interface NewsItem {
  title: string;
  description: string;
  fullNews: string;
  date: string;
  image: string;
  category: string;
  slug: string;
  id: string;
  author: string;
  ministry: string;
  media?: Array<{
    fields?: {
      file?: {
        url?: string;
      };
      title?: string;
    };
  }>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function NewsDetailPage() {
  const params = useParams();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [oldestNews, setOldestNews] = useState<NewsItem[]>([]);
  
  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const newsList = await getNewsList();
        const slug = params.slug as string;
        
        // Find the news item by matching the slug
        const foundItem = newsList.find((item) => 
          slugify(item.title) === slug
        );
        
        if (foundItem) {
          setNewsItem(foundItem);
          
          // Get oldest news (excluding current item)
          const oldest = newsList
            .filter((item) => slugify(item.title) !== slug)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
          setOldestNews(oldest);
        }
      } catch (error) {
        console.error('Error fetching news item:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsItem();
  }, [params.slug]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!newsItem) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">News Article Not Found</h1>
          <Link href="/news" className="text-green-600 hover:underline">
            Back to News
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Back to News Button */}
      
      
      {/* Section 1: Hero + Body */}
      <section className="relative w-full pb-[180px]">
        <NewsHeroSection />
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/news"
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </Link>
        </div>
      </div>
        <NewsBodySection>
          {/* Title & Meta */}
          <div className="relative z-10 w-full flex justify-center pb-2">
            <div className="w-full max-w-3xl rounded-xl overflow-hidden shadow-lg">
              <Image
                src={newsItem.image}
                alt={newsItem.title}
                width={900}
                height={400}
                className="object-cover w-full h-[260px] md:h-[320px]"
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {newsItem.title}
            </h1>
            <p className="text-gray-500 text-sm">{newsItem.date} • {newsItem.category}</p>
            <p className="text-gray-600 text-sm mt-1">By {newsItem.author} • {newsItem.ministry}</p>
          </div>

          {/* Main Content */}
          <div>
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 mb-6 text-lg leading-relaxed">
                {newsItem.fullNews.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>

            {/* Secondary Media Image */}
            <div className="w-full flex justify-center my-8">
              <div className="w-full max-w-md rounded-xl overflow-hidden">
                <Image
                  src={newsItem.media?.[0]?.fields?.file?.url ? `https:${newsItem.media[0].fields.file.url}` : newsItem.image}
                  alt={newsItem.media?.[0]?.fields?.title || newsItem.title}
                  width={600}
                  height={300}
                  className="object-cover w-full h-64"
                />
              </div>
            </div>

           
          </div>
        </NewsBodySection>
      </section>

      {/* Section 2: Oldest News */}
      <div className="w-full bg-[#181c23] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">OLDEST NEWS</h2>
            <Link
              href="/news"
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg shadow transition"
            >
              See All News
            </Link>
          </div>
          
          {oldestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oldestNews.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/news/${slugify(item.title)}`}
                  className="bg-[#232323] rounded-xl bg-white overflow-hidden hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  <div className="relative w-full h-32">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-black text-sm font-semibold mb-2 line-clamp-2 leading-tight">
                      {item.title}
                    </div>
                    <div className="text-gray-400 text-xs mb-1">{item.date}</div>
                    <div className="text-green-400 text-xs">{item.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No older news articles found.</p>
              <Link
                href="/news"
                className="inline-block mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg shadow transition"
              >
                Browse All News
              </Link>
            </div>
          )}
        </div>
      </div>
      <CTASection
          heading="Join Us in Quality Education"
          subtext="Be part of our mission to improve the quality of education in Imo State."
          buttonLabel="Contact Us"
          buttonHref="/contact-us"
         />
                    
      <Footer />  
      {/* Section 3: Footer */}
     
    </div>
  );
}
