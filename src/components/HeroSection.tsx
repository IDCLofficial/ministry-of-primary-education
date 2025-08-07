'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import AnimatedSection from './AnimatedSection';
import { TypingText } from './TypingText';

interface HeroSectionProps {
  overlayText: string;
  heading: string;
  description: string;
  backgroundImages: string[]; // Changed from backgroundImage
}

export default function HeroSection({
  overlayText,
  heading,
  description,
  backgroundImages,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // 2 seconds

    return () => clearInterval(interval); // Cleanup
  }, [backgroundImages.length]);

  return (
    <section className="relative h-screen px-1 md:px-[3rem] flex flex-col justify-center bg-black">
      {/* Slideshow background */}
      {backgroundImages.map((img, index) => (
        <Image
          key={index}
          src={img}
          alt={`Hero background ${index + 1}`}
          fill
          className={`object-cover object-center absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          priority={index === 0}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 w-[96%] md:w-[100%] mx-auto px-6 flex flex-col items-start">
        <AnimatedSection>
          <div
            className="px-8 py-3 animate-fadeInUpDynamic flex justify-center text-xs lg:text-xl items-center bg-white text-gray-900 rounded-full font-semibold shadow-lg min-h-12"
          >
            {overlayText}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.3} yOffset={100}>
          <h1
            className="animate-fadeInUpDynamic text-[30px] xl:text-[40px] 2xl:text-[62px] font-extrabold text-white leading-tight mb-4 mt-4"
          >
            {heading}<br />
            <TypingText />
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.6}>
          <p className="animate-fadeInUpDynamic text-white text-[16px] md:text-[20px] md:text-xl font-medium max-w-2xl ">
            {description}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
