import React from "react";

interface MediaHeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  searchBar?: React.ReactNode;
}

const MediaHeroSection: React.FC<MediaHeroSectionProps> = ({ title, subtitle, backgroundImage, searchBar }) => {
  return (
    <section
      className="relative w-full h-[80vh] flex flex-col justify-center items-center text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center h-full px-4">
        <h1 className="text-white text-3xl 2xl:text-5xl font-bold mb-4 drop-shadow-lg">{title}</h1>
        <p className="text-white text-md 2xl:text-xl mb-8 max-w-2xl drop-shadow-lg">{subtitle}</p>
        {searchBar && <div className="w-full max-w-xl mx-auto">{searchBar}</div>}
      </div>
    </section>
  );
};

export default MediaHeroSection; 