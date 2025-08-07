import React, { useState } from "react";
import MediaGalleryCard from "./MediaGalleryCard";

interface MediaItem {
  image: string;
  title: string;
  isVideo?: boolean;
}

interface MediaGalleryGridProps {
  items: MediaItem[];
}

const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex + 1) % items.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex - 1 + items.length) % items.length);
    }
  };

  const handleClose = () => {
    setCurrentIndex(null);
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => !item.isVideo && setCurrentIndex(idx)}
            className="cursor-pointer"
          >
            <MediaGalleryCard
              image={item.image}
              title={item.title}
              isVideo={item.isVideo}
            />
          </div>
        ))}
      </div>

      {currentIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <img
            src={items[currentIndex].image}
            alt={items[currentIndex].title}
            className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
          />

          {/* Close button */}
          <button
            className="absolute top-5 right-6 text-white text-4xl font-bold cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </button>

          {/* Previous arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold cursor-pointer"
          >
            &#8249;
          </button>

          {/* Next arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold cursor-pointer"
          >
            &#8250;
          </button>
        </div>
      )}
    </>
  );
};

export default MediaGalleryGrid;
