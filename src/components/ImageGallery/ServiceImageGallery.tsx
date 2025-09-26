import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ServiceImageGalleryProps {
  images: string[];
  serviceName: string;
  className?: string;
}

export const ServiceImageGallery = ({ images, serviceName, className = '' }: ServiceImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter out empty or invalid images
  const validImages = images.filter(img => img && img.trim() !== '');
  
  // Fallback image if no valid images
  const fallbackImage = "/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png";
  const displayImages = validImages.length > 0 ? validImages : [fallbackImage];

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isLightboxOpen) {
      switch (e.key) {
        case 'ArrowLeft':
          prevLightboxImage();
          break;
        case 'ArrowRight':
          nextLightboxImage();
          break;
        case 'Escape':
          setIsLightboxOpen(false);
          break;
      }
    }
  }, [isLightboxOpen, prevLightboxImage, nextLightboxImage]);

  React.useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLightboxOpen, handleKeyDown]);

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image Display */}
        <div className="relative h-96 rounded-2xl overflow-hidden group">
          <img
            src={displayImages[currentImageIndex]}
            alt={`${serviceName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
              }
            }}
          />
          
          {/* Expand Button */}
          <button
            onClick={() => openLightbox(currentImageIndex)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label="View full size"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Navigation Buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous image"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Next image"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} of {displayImages.length}
              </div>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentImageIndex === index 
                        ? 'bg-white scale-110' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {displayImages.length > 1 && (
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    currentImageIndex === index
                      ? 'border-primary shadow-lg'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${serviceName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== fallbackImage) {
                        target.src = fallbackImage;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen bg-black/95 border-none p-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Lightbox Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={displayImages[lightboxIndex]}
                alt={`${serviceName} - Full size image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== fallbackImage) {
                    target.src = fallbackImage;
                  }
                }}
              />
            </div>

            {/* Lightbox Navigation */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevLightboxImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextLightboxImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Lightbox Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-lg font-medium">
                  {lightboxIndex + 1} of {displayImages.length}
                </div>

                {/* Thumbnail Strip in Lightbox */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-sm overflow-x-auto">
                  <div className="flex gap-2 p-2">
                    {displayImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          lightboxIndex === index
                            ? 'border-white'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== fallbackImage) {
                              target.src = fallbackImage;
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};