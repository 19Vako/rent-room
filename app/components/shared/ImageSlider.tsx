"use client";

import Image from "next/image";
import { useState, useRef } from "react";

interface ImageSliderProps {
  photos: string[];
}

export default function ImageSlider({ photos }: ImageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentSlide(index);
    }
  };

  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.clientWidth * index,
        behavior: "smooth",
      });
      setCurrentSlide(index);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full h-[350px] md:h-[500px] rounded-lg overflow-hidden group">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {photos.map((url, index) => (
            <div
              key={index}
              className="relative flex-none w-full h-full snap-center bg-gray-100"
            >
              <Image
                src={url}
                alt={`Room photo ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => scrollToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-3 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <button
              onClick={() => scrollToSlide(currentSlide + 1)}
              disabled={currentSlide === photos.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-3 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
            {currentSlide + 1} / {photos.length}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {photos.map((url, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`relative flex-none w-[80px] h-[60px] md:w-[100px] md:h-[75px] rounded-md overflow-hidden border-2 transition-all bg-gray-100 ${
                currentSlide === index
                  ? "border-[#0071c2] ring-2 ring-[#0071c2]/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
