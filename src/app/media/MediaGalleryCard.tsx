import React, { useState } from "react";
import Image from "next/image";

interface MediaGalleryCardProps {
  image: string;
  title: string;
  isVideo?: boolean;
}

const MediaGalleryCard: React.FC<MediaGalleryCardProps> = ({ image, title, isVideo }) => {
  const [imageError, setImageError] = useState(false);
  // Format the image URL once on component mount
  const imageUrl = image ? (image.startsWith('//') ? `https:${image}` : image) : '';

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`);
    setImageError(true);
  };

  if (!imageUrl || imageError) {
    return (
      <div className="bg-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Image not available</span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <span className="text-xs font-semibold text-gray-800">{title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full cursor-pointer transition hover:shadow-md">
      <div className="relative w-full h-48">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover"
          onError={handleImageError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
              <polygon points="20,16 34,24 20,32" fill="#fff" />
            </svg>
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-sm font-medium text-gray-800 line-clamp-2">{title}</span>
      </div>
    </div>
  );
};

export default MediaGalleryCard;