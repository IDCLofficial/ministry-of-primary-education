import React from "react";
import Image from "next/image";

interface MediaGalleryCardProps {
  image: string;
  title: string;
  isVideo?: boolean;
}

const MediaGalleryCard: React.FC<MediaGalleryCardProps> = ({ image, title, isVideo }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col cursor-pointer transition hover:shadow-md">
      <div className="relative w-full h-48">
        <Image src={image} alt={title} fill className="object-cover" />
        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
              <polygon points="20,16 34,24 20,32" fill="#fff" />
            </svg>
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs font-semibold text-gray-800 mb-1">{title}</span>
      </div>
    </div>
  );
};

export default MediaGalleryCard; 