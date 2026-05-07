"use client";

import { useState, useMemo } from "react";
import { useSearchRoomsStore } from "@/store/useSearchRoomsStore";

export default function PriceFilter() {
  const { rooms, priceRange, setPriceRange, isLoading } = useSearchRoomsStore();

  const { absoluteMin, absoluteMax } = useMemo(() => {
    if (rooms.length === 0) return { absoluteMin: 0, absoluteMax: 10000 };
    const prices = rooms.map((room) => room.price);
    return {
      absoluteMin: Math.min(...prices),
      absoluteMax: Math.max(...prices),
    };
  }, [rooms]);

  const [localMin, setLocalMin] = useState<number | null>(null);
  const [localMax, setLocalMax] = useState<number | null>(null);

  const currentMin = localMin ?? priceRange?.min ?? absoluteMin;
  const currentMax = localMax ?? priceRange?.max ?? absoluteMax;

  // Показываем фильтр цены только после появления данных в списке.
  // Иначе на старте/во время загрузки он выглядит "в пустоту".
  if (isLoading || rooms.length === 0) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), currentMax - 100);
    setLocalMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), currentMin + 100);
    setLocalMax(value);
  };

  const handleMouseUp = () => {
    setPriceRange({ min: currentMin, max: currentMax });
    setLocalMin(null);
    setLocalMax(null);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
      <div className="w-full max-w-sm p-4 rounded-xl border border-gray-300 rounded-lg p-4 gap-4 md:gap-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Ваш бюджет (за ночь)
        </h3>

        <div className="text-gray-700 font-medium mb-6">
          UAH {currentMin.toLocaleString("uk-UA")} — UAH{" "}
          {currentMax.toLocaleString("uk-UA")}
          {currentMax === absoluteMax ? "+" : ""}
        </div>

        <div className="relative h-20 pt-10">
          <div className="absolute top-[50%] left-0 right-0 h-2 bg-gray-200 rounded-full mt-[-4px]"></div>

          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            step="100"
            value={currentMin}
            onChange={handleMinChange}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className="absolute top-[50%] left-0 w-full h-2 mt-[-4px] appearance-none pointer-events-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-[#3b5998] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />

          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            step="100"
            value={currentMax}
            onChange={handleMaxChange}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className="absolute top-[50%] left-0 w-full h-2 mt-[-4px] appearance-none pointer-events-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-[#3b5998] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </>
  );
}
