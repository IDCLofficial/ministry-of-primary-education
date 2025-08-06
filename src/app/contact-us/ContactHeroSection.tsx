import React from "react";

interface ContactHeroSectionProps {
  title: string;
}

const ContactHeroSection: React.FC<ContactHeroSectionProps> = ({ title }) => (
  <section className="relative w-full h-[180px] md:h-[200px] flex items-center justify-center bg-gradient-to-b from-green-900 via-green-700 to-green-400">
    <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg z-10">{title}</h1>
  </section>
);

export default ContactHeroSection; 