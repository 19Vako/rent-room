"use client";
import { useSearchRoomsStore } from "@/store/useSearchRoomsStore";
import RoomListCard from "./RoomListCard";

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
      <div className="w-full max-w-5xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Options:</h2>
        <div className="flex flex-col gap-5 w-full">
          {rooms.map((room) => (

            <RoomListCard key={room.id?.toString()} room={room} />

          ))}
        </div>
      </div>
    );
  }

  return null;
}