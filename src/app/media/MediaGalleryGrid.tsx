import React, { useState, useEffect } from "react";
import Image from "next/image";
import MediaGalleryCard from "./MediaGalleryCard";

interface MediaItem {
  image: string;
  title: string;
  isVideo?: boolean;
}

interface MediaGalleryGridProps {
  items: MediaItem[];
  itemsPerPage?: number;
}

const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  items,
  itemsPerPage: initialItemsPerPage = 9 // Default to 9 items (3x3 grid)
}) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(0);

  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate items per page based on screen size
  const calculateItemsPerPage = () => {
    if (windowWidth < 768) return 4; // 1 column, 4 rows
    if (windowWidth < 1024) return 6; // 2 columns, 3 rows
    return initialItemsPerPage; // 3 columns, 3 rows
  };

  const effectiveItemsPerPage = calculateItemsPerPage();
  const totalPages = Math.ceil(items.length / effectiveItemsPerPage);
  const indexOfLastItem = currentPage * effectiveItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - effectiveItemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page if current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Don't render if no items
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No media items found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item, idx) => (
          <div
            key={`${indexOfFirstItem + idx}-${item.image}`}
            onClick={() => !item.isVideo && setCurrentIndex(indexOfFirstItem + idx)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <MediaGalleryCard
              image={item.image}
              title={item.title}
              isVideo={item.isVideo}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-12 gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Previous page"
          >
            &larr; Previous
          </button>
          
          {/* First page */}
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => paginate(1)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                1
              </button>
              {currentPage > 4 && <span className="px-2 py-2">...</span>}
            </>
          )}
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return pageNum > 0 && pageNum <= totalPages ? (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ) : null;
          })}
          
          {/* Last page */}
          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2 py-2">...</span>}
              <button
                onClick={() => paginate(totalPages)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  currentPage === totalPages
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Next page"
          >
            Next &rarr;
          </button>
        </div>
      )}

      {/* Lightbox for image preview */}
      {currentIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex justify-center">
            <div className="relative w-full h-[80vh]">
              <Image
                src={items[currentIndex].image}
                alt={items[currentIndex].title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>

            <div className="absolute -top-12 right-0 flex space-x-4">
              <span className="text-white text-lg">
                {currentIndex + 1} of {items.length}
              </span>
              <button
                onClick={handleClose}
                className="text-white text-3xl hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-colors"
              aria-label="Previous image"
            >
              &#8249;
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-colors"
              aria-label="Next image"
            >
              &#8250;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGalleryGrid;
