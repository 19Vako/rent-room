"use client";

import { useState } from "react";

export default function SearchWidget() {
  // Заглушки для логики (состояния)
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Функция, которая потом будет фильтровать комнаты
  const handleSearch = () => {
    console.log("Ищем свободные номера:", { checkIn, checkOut, guests });
    // В будущем здесь мы будем менять URL, например:
    // router.push(`/?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  };

  return (
    // Желтая обертка в стиле Booking
    <div className="bg-[#febb02] p-1 rounded shadow-lg flex flex-col md:flex-row gap-1 w-full max-w-4xl mx-auto">
      
      {/* Блок выбора дат (Заезд - Выезд) */}
      <div className="flex bg-white rounded-sm items-center flex-1 relative">
        <div className="flex items-center pl-4 pr-2">
          {/* Иконка календаря */}
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div className="flex flex-1 divide-x divide-gray-300">
          <input 
            type="date" 
            className="w-full py-3 px-2 outline-none bg-transparent text-gray-800 font-medium cursor-pointer"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            title="Дата заезда"
          />
          <input 
            type="date" 
            className="w-full py-3 px-2 outline-none bg-transparent text-gray-800 font-medium cursor-pointer"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            title="Дата выезда"
          />
        </div>
      </div>

      {/* Блок количества гостей */}
      <div className="flex bg-white rounded-sm items-center w-full md:w-[250px]">
        <div className="flex items-center pl-4 pr-2">
          {/* Иконка человека */}
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        {/* Используем обычный select для простоты, стилизуем под текст */}
        <select 
          className="w-full py-3 pr-4 outline-none bg-transparent text-gray-800 font-medium cursor-pointer"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'гость' : num < 5 ? 'гостя' : 'гостей'}
            </option>
          ))}
        </select>
      </div>

      {/* Синяя кнопка "Найти" */}
      <button 
        onClick={handleSearch}
        className="bg-[#0071c2] hover:bg-[#005999] text-white text-xl font-bold py-3 px-8 rounded-sm transition-colors duration-200"
      >
        Найти
      </button>

    </div>
  );
}