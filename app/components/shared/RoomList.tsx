// components/RoomList.tsx
"use client";
import { useSearchRoomsStore } from "@/store/useSearchRoomsStore";

export default function RoomList() {

  const { rooms, isLoading, error, searchDates } = useSearchRoomsStore();

  if (isLoading) {
    return (
      <div className="mt-10 text-center text-xl text-gray-500 w-full max-w-6xl mx-auto">
        Finding the best options for you... 🔍
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-red-500 font-semibold bg-red-50 p-3 rounded w-full max-w-6xl mx-auto">
        {error}
      </div>
    );
  }

  if (searchDates && rooms.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10 w-full max-w-6xl mx-auto">
        There are no available rooms for these dates. Please try changing the check-in dates.
      </p>
    );
  }

  if (rooms.length > 0) {
    return (
      <div className="mt-10 w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Options:</h2>
        <div className="flex flex-col gap-4">
          {rooms.map((room) => (

            <div key={room.id?.toString()} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-xl font-bold text-[#0071c2]">{room.roomName}</h3>
                <p className="text-gray-600 mt-1">Capacity: up to {room.capacity} guests</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{room.price} ₴</p>
                <p className="text-sm text-gray-500">per night</p>
                <button className="mt-2 bg-[#0071c2] hover:bg-[#005999] text-white px-4 py-2 rounded-sm font-semibold transition-colors">
                    Rent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}