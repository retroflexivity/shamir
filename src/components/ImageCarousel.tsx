import React, { useState, useEffect } from "react";

export interface ImageCarouselProps {
  images: string[];
  autoScrollInterval?: number; // milliseconds
  className?: string;
}

export function ImageCarousel({ 
  images, 
  autoScrollInterval = 3000,
  className = ""
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [images.length, autoScrollInterval]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={className}>
        <img 
          src={images[0]} 
          alt="" 
          className="w-full h-auto rounded-lg object-contain"
          style={{ maxHeight: 'none' }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full flex-shrink-0 w-full">
              <img 
                src={image} 
                alt="" 
                className="w-full h-auto object-contain"
                style={{ maxHeight: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-lightaccent dark:bg-darkaccent w-6' 
                : 'bg-lightfg/30 dark:bg-darkfg/30 hover:bg-lightfg/50 dark:hover:bg-darkfg/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
