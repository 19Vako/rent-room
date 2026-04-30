"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Room from "@/types/Room";
import { ObjectId } from "mongodb";
import { useRouter } from "next/navigation";
import { useSettingData } from "@/store/useSettingData";

export default function AdminRoomSelector({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedRoom, setSelectedRoom } = useSettingData();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom, setSelectedRoom]);

  function handleViewRoom() {
    router.push(`/admin/edit-room/${selectedRoom?.id}`);
  }

  if (!selectedRoom) return null;

  const getShortId = (id: string | ObjectId) => {
    const idStr = id.toString();
    return idStr.length > 7
      ? idStr.substring(idStr.length - 7).toUpperCase()
      : idStr;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
        >
          <span className="font-bold text-lg">{selectedRoom.roomName}</span>

          <span className="border border-white text-sm px-1.5 py-0.5 rounded-sm bg-transparent tracking-wide">
            {getShortId(selectedRoom.id as string)}
          </span>

          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        <button
          onClick={handleViewRoom}
          className="text-white hover:text-gray-200 ml-1"
          title="View property on site"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            ></path>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-[340px] bg-white shadow-[0_4px_20px_-3px_rgba(0,0,0,0.15)] z-50 rounded-sm overflow-hidden text-[#1a1a1a] border border-gray-200">
          <div className="max-h-[60vh] overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.id?.toString()}
                onClick={() => {
                  setSelectedRoom(room);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-4 p-4 hover:bg-gray-100 cursor-pointer transition-colors ${selectedRoom.id === room.id ? "bg-gray-50" : ""}`}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-100 shadow-sm">
                  {room.photoUrl && room.photoUrl[0] ? (
                    <img
                      src={room.photoUrl[0]}
                      alt={room.roomName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#003580] flex items-center justify-center text-white font-bold">
                      {room.roomName.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-bold text-[15px] text-[#1a1a1a]">
                    {room.roomName}
                  </p>
                  <span className="inline-block border border-gray-400 text-gray-600 text-[13px] px-1.5 py-[1px] rounded-sm mt-0.5">
                    {getShortId(room.id as string)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 bg-gray-50">
            <Link
              href="/admin/create-room"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-4 hover:bg-gray-100 transition-colors text-[#006CE4] font-medium"
            >
              <div className="w-11 h-11 rounded-full shrink-0 border border-dashed border-[#006CE4] flex items-center justify-center bg-white">
                <svg
                  className="w-5 h-5 text-[#006CE4]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="font-bold text-[15px]">Add new room</p>
                <p className="text-[13px] text-gray-500 font-normal">
                  Create listing
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
