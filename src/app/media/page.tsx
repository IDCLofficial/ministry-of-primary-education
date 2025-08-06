'use client';

import React, { useState } from "react";
import MediaHeroSection from "./MediaHeroSection";
import MediaGalleryGrid from "./MediaGalleryGrid";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import MediaSearchBar from "./MediaSearchBar";

const mediaItems = [
  {
    image: "/images/class1.png",
    title: "Imo Teachers Honored for Excellence in Public Education",
    isVideo: false,
  },
  {
    image: "/images/imoschool1.png",
    title: "Primary Schools Renovated Under Statewide Infrastructure Drive",
    isVideo: false,
  },
  {
    image: "/images/class3.png",
    title: "Commissioner’s Inspection Tour of Model Schools in Owerri Zone",
    isVideo: false,
  },
];

export default function MediaPage() {
  const [search, setSearch] = useState("");

  const filteredItems = mediaItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen w-full bg-[#F7F9FA] flex flex-col">
      <MediaHeroSection
        title="Transforming Primary Education in Imo State"
        subtitle="Explore our gallery of school development projects, classroom upgrades, teacher recognitions, and outreach initiatives."
        backgroundImage="/images/gradient.png"
        searchBar={<MediaSearchBar placeholder="Search media..." onSearch={setSearch} />}
      />
      
      <section className="w-full max-w-7xl mx-auto py-12 px-4">
        <div className="mt-8">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 text-lg font-semibold py-12">
              No results found
            </div>
          ) : (
            <MediaGalleryGrid items={filteredItems} />
          )}
        </div>
      </section>

      <CTASection
        heading="Support Quality Education for Every Imo Child"
        subtext="Partner with us to expand access to safe classrooms, train educators, and deliver inclusive, 21st-century learning across all LGAs."
        buttonLabel="Contact Us"
        buttonHref="/contact-us"
      />

      <Footer />
    </main>
  );
}
