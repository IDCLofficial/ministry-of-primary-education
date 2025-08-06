import React from "react";


const NewsHeroSection = () => (
  <section className="relative w-full h-[400px] md:h-[380px] flex items-end justify-center bg-gradient-to-b from-green-900 via-green-700 to-green-400 overflow-hidden">
    <div className="absolute inset-0 bg-[url('/images/gradient.png')] bg-cover bg-center z-0 opacity-80" />
  </section>
);

export default NewsHeroSection; 