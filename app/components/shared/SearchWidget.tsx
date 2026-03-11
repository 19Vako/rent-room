"use client";
import Room from "@/types/Room";

import { useState } from "react";
// Обязательно проверь правильность пути импорта для твоего проекта!
import { getAvailableRooms } from "@/lib/actions/order.actions"; 

export default function SearchWidget() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // --- НОВЫЕ СТЕЙТЫ ДЛЯ ДАННЫХ ---
  const [rooms, setRooms] = useState<Room[]>([]); // Сюда положим результат
  const [isLoading, setIsLoading] = useState(false); // Крутилка загрузки
  const [error, setError] = useState(""); // Сообщения об ошибках

  const handleSearch = async () => {
    // Базовая валидация: проверяем, выбрал ли юзер даты
    if (!checkIn || !checkOut) {
      setError("Пожалуйста, выберите даты заезда и выезда.");
      return;
    }

    // Проверяем, что дата выезда позже даты заезда
    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("Дата выезда должна быть позже даты заезда.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRooms([]);

    try {
      // Магия Next.js: вызываем серверную функцию напрямую!
      const result = await getAvailableRooms(
        new Date(checkIn), 
        new Date(checkOut), 
        guests
      );

      if (result.success && result.rooms) {
        setRooms(result.rooms); // Сохраняем найденные комнаты в стейт
        console.log("Найденные комнаты:", result.rooms);
      } else {
        setError(result.error || "Не удалось найти комнаты.");
      }
    } catch (err) {
      console.error(err);
      setError("Произошла системная ошибка.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Тот самый желтый виджет поиска */}
      <div className="bg-[#febb02] p-1 rounded shadow-lg flex flex-wrap md:flex-nowrap gap-1 w-full max-w-6xl mx-auto">
        <div className="flex flex-wrap md:flex-nowrap flex-1 bg-white rounded-sm divide-x divide-gray-300">
          {/* ... твои инпуты для дат и гостей остаются без изменений ... */}
          {/* 1. Дата заезда */}
          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px]">
            {/* ... svg ... */}
            <input 
              type="date" 
              className="w-full py-2 outline-none bg-transparent"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          {/* 2. Дата выезда */}
          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px]">
            {/* ... svg ... */}
            <input 
              type="date" 
              className="w-full py-2 outline-none bg-transparent"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          {/* 3. Гости */}
          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px] md:max-w-[250px]">
            {/* ... svg ... */}
            <select 
              className="w-full py-2 outline-none bg-transparent"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} гостей</option>
              ))}
            </select>
          </div>
        </div>

        {/* Кнопка с индикатором загрузки */}
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-[#0071c2] hover:bg-[#005999] disabled:bg-blue-300 text-white text-xl font-bold py-3 px-8 rounded-sm transition-colors duration-200 shrink-0 w-full md:w-auto flex justify-center items-center"
        >
          {isLoading ? "Ищем..." : "Найти"}
        </button>
      </div>

      {/* Вывод ошибки, если она есть */}
      {error && (
        <div className="mt-4 text-red-500 font-semibold bg-red-50 p-3 rounded w-full max-w-6xl">
          {error}
        </div>
      )}

      <div className="mt-10 w-full max-w-6xl">
        {rooms.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Доступные варианты:</h2>
            <div className="flex flex-col gap-4">
              {rooms.map((room) => (
                // Позже мы заменим этот div на твой красивый компонент <RoomCard />
                <div key={room.id?.toString()} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h3 className="text-xl font-bold text-[#0071c2]">{room.roomName}</h3>
                  <p>Вместимость: до {room.capacity} гостей</p>
                  <p className="font-bold mt-2">Цена: {room.price} ₴ / ночь</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !isLoading && checkIn && checkOut && !error && (
            <p className="text-gray-500 text-center py-10">Пока мы ничего не нашли. Попробуйте изменить даты поиска.</p>
          )
        )}
      </div>
    </div>
  )
}