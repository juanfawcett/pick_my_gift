'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GiftCarouselProps {
  photos: string[];
  name: string;
}

export function GiftCarousel({ photos, name }: GiftCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-square relative w-full bg-gray-100 rounded-md overflow-hidden my-4 flex items-center justify-center text-gray-400">
        Sin foto
      </div>
    );
  }

  return (
    <div className="aspect-square relative w-full bg-gray-100 rounded-md overflow-hidden my-4 group">
      <Image
        src={photos[currentPhotoIndex]}
        alt={name}
        fill
        className="object-contain transition-all duration-300"
      />
      {photos.length > 1 && (
        <>
          {/* Contador de fotos */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm z-10 font-medium">
            {currentPhotoIndex + 1} / {photos.length}
          </div>

          <div className="absolute inset-0 flex items-center justify-between p-2 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/90 shadow-md hover:bg-white text-primary transition-transform active:scale-90"
              onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/90 shadow-md hover:bg-white text-primary transition-transform active:scale-90"
              onClick={() => setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/10 px-2 py-1.5 rounded-full backdrop-blur-[2px]">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentPhotoIndex ? 'bg-primary w-4' : 'bg-white/70 w-1.5 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
