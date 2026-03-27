"use client";

import { useEffect, useState } from "react";
import { updateRoom } from "@/lib/actions/room.actions";
import { blockRoomDates } from "@/lib/actions/room.actions";
import Room from "@/types/Room";
import { useRoomStore } from "@/store/useRoomStore.ts";  

const getTodayFormatted = () => new Date().toISOString().split("T")[0];

export default function SetUpDates() {
  const { selectedRoom, setSelectedRoom } = useRoomStore();
  
  const [startDate, setStartDate] = useState<string>(getTodayFormatted());
  const [endDate, setEndDate] = useState<string>(getTodayFormatted());
  const [roomPrice, setRoomPrice] = useState<number>(selectedRoom?.price || 0);
  const [roomStatus, setRoomStatus] = useState<Room["status"]>(selectedRoom?.status || "AVAILABLE");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      setRoomPrice(selectedRoom.price);
      setRoomStatus(selectedRoom.status || "AVAILABLE");
      setStartDate(getTodayFormatted());
      setEndDate(getTodayFormatted());
    }
  }, [selectedRoom]);

  if (!selectedRoom) return <div className="p-5 text-black">Loading room data...</div>;

  const handleSave = async () => {
    if (!selectedRoom?.id) return;
    setIsSaving(true);
    
    try {

      const updatedRoomData: Room = {
        ...selectedRoom,
        price: roomPrice,
        status: roomStatus
      };
      await updateRoom(selectedRoom.id.toString(), updatedRoomData);
      if (roomStatus !== "AVAILABLE") {
        const blockResult = await blockRoomDates(
          selectedRoom.id.toString(),
          startDate,
          endDate,
          roomStatus
        );
        
        if (!blockResult.success) {
          setIsSaving(false);
          return;
        }
      }
      setSelectedRoom(updatedRoomData)

    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setRoomStatus(selectedRoom.status || "AVAILABLE");
    setRoomPrice(selectedRoom.price);
    setStartDate(getTodayFormatted());
    setEndDate(getTodayFormatted());
  } 

  return (
    <div className="w-full lg:w-[380px] shrink-0 border border-gray-200 bg-white shadow-sm mt-12">
 
      <div className="p-5 border-b border-gray-200 space-y-4">
        <h3 className="font-bold text-black">Select Dates</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-black mb-1">Start date</label>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white focus-within:border-[#0071c2] focus-within:ring-1 focus-within:ring-[#0071c2]">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full outline-none text-black bg-transparent cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-black mb-1">End date</label>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white focus-within:border-[#0071c2] focus-within:ring-1 focus-within:ring-[#0071c2]">
              <input 
                type="date" 
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full outline-none text-black bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      
      <div className="p-5">
        <h4 className="font-medium text-black mb-3">Room Status for selected dates</h4>
        
        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="AVAILABLE"
              checked={roomStatus === "AVAILABLE"} 
              onChange={() => setRoomStatus("AVAILABLE")}
              className="w-4 h-4 text-[#0071c2] focus:ring-[#0071c2]" 
            />
            <span className="text-black">Available (Open)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="MAINTENANCE"
              checked={roomStatus === "MAINTENANCE"} 
              onChange={() => setRoomStatus("MAINTENANCE")}
              className="w-4 h-4 text-[#0071c2] focus:ring-[#0071c2]" 
            />
            <span className="text-black">Maintenance (Closed)</span>
          </label>
        </div>

        <div className="mb-8">
          <label className="block text-sm text-black mb-1">Price per night</label>
          <div className="flex items-stretch border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-[#0071c2] focus-within:border-[#0071c2]">
            <span className="bg-gray-100 px-4 py-2 text-black border-r border-gray-300">UAH</span>
            <input 
              type="number" 
              value={roomPrice}
              onChange={(e) => setRoomPrice(Number(e.target.value))}
              className="w-full px-3 py-2 outline-none text-black bg-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={cancel}
            className="flex-1 py-2 px-4 border border-gray-300 text-black rounded hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 py-2 px-4 text-white rounded transition-colors font-medium ${isSaving ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#0071c2] hover:bg-[#005999]'}`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}