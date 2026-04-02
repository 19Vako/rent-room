"use client";

import { useEffect, useState } from "react";
import { updateRoom, blockRoomDates, unblockRoomDates } from "@/lib/actions/room.actions";
import { useSettingData, getTodayFormatted  } from "@/store/useSettingData";  
import SettingsForm from "./SettingsForm";  
import ActionModal from "./ActionModal";    



export default function SetUpDates() {
  const { selectedRoom, setSelectedRoom, setStartDate, setEndDate, startDate, endDate } = useSettingData();

  const [roomPrice, setRoomPrice] = useState<number>(0);
  const [roomStatus, setRoomStatus] = useState<string>("AVAILABLE");
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: "success" | "error"; message: string }>({
    isOpen: false,
    type: "success",
    message: "",
  });

 
  useEffect(() => {
    if (selectedRoom) {
      setRoomPrice(selectedRoom.price);
      setRoomStatus("AVAILABLE");  
    }
  }, [selectedRoom]);

 
  const handleSave = async () => {
    if (!selectedRoom?.id) return;
    setIsSaving(true);
    
    try {
      const updatedRoomData = { ...selectedRoom, price: roomPrice };
      if ('status' in updatedRoomData) delete (updatedRoomData).status;
      
      await updateRoom(selectedRoom.id.toString(), updatedRoomData);

      if (roomStatus !== "AVAILABLE") {
        const blockResult = await blockRoomDates(selectedRoom.id.toString(), startDate, endDate, roomStatus);
        if (!blockResult.success) {
          setModal({ isOpen: true, type: "error", message: blockResult.error || "Error" });
          setIsSaving(false);
          return;
        }
      } else {
        const unblockResult = await unblockRoomDates(selectedRoom.id.toString(), startDate, endDate);
        if (!unblockResult.success) {
          setModal({ isOpen: true, type: "error", message: unblockResult.error || "Error" });
          setIsSaving(false);
          return;
        }
      }

      setSelectedRoom({ ...updatedRoomData });
      setModal({ isOpen: true, type: "success", message: "Dates and settings updated successfully!" });

    } catch (error) {
      console.error(error);
      setModal({ isOpen: true, type: "error", message: "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

 
  const cancel = () => {
    setRoomStatus("AVAILABLE");
    if (selectedRoom) setRoomPrice(selectedRoom.price);
    setStartDate(getTodayFormatted());
    setEndDate(getTodayFormatted());
  };

  if (!selectedRoom) return <div className="p-5 text-black">Loading room data...</div>;

  return (
    <>
      <div className="w-full lg:w-[380px] shrink-0 border border-gray-200 bg-white shadow-sm mt-23 flex flex-col">
        
        <SettingsForm 
          startDate={startDate}
          endDate={endDate}
          roomStatus={roomStatus}
          roomPrice={roomPrice}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStatusChange={setRoomStatus}
          onPriceChange={setRoomPrice}
        />

        
        <div className="px-5 pb-5 mt-auto flex gap-3">
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

      {/* Вынесенная модалка */}
      <ActionModal 
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </>
  );
}