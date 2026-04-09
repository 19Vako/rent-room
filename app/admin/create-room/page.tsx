"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/shared/BackButton";
import Room from "@/types/Room";
import { createRoom } from "@/lib/actions/room.actions"; 


export default function CreateRoomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roomName: "",
    type: "STANDARD" as Room["type"],
    price: "", 
    capacity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const roomDataToSubmit: Omit<Room, "id" | "status"> = {
      roomName: formData.roomName,
      type: formData.type,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      photoUrl: [],  
    };
    
    const result = await createRoom(roomDataToSubmit);
    

    if (result.success && result.roomId) {
      setSuccessMsg("Room created successfully! Redirecting to setup...");
      router.push(`/admin/edit-room/${result.roomId}`);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12 font-sans">
      <header className="bg-[#003580] flex items-center px-4 h-16 border-b border-[#002255] z-50 relative">
        <BackButton className="text-white" />
      </header>

      <div className="max-w-[800px] mx-auto mt-8 px-4">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1a1a1a]">Add New Room</h1>
          <p className="text-[15px] text-gray-600 mt-1">Fill in the details to make the room available for booking.</p>
        </div>

 
        {error && (
          <div className="bg-[#ffebe8] border border-[#cc0000] text-[#cc0000] px-4 py-3 rounded-sm mb-6 text-[14px]">
            <span className="font-bold">Error: </span>{error}
          </div>
        )}
        
 
        {successMsg && (
          <div className="bg-[#e8f6e8] border border-[#008009] text-[#008009] px-4 py-3 rounded-sm mb-6 text-[14px]">
            <span className="font-bold">Success! </span>{successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-md p-6 md:p-8">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-[14px] font-bold text-[#1a1a1a] mb-2">Room Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="roomName"
                required
                value={formData.roomName}
                onChange={handleChange}
                className="w-full border text-black border-gray-400 rounded-sm p-3 text-[14px] focus:ring-2 focus:ring-[#006CE4] outline-none"
                placeholder="e.g., Cozy Standard"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[14px] font-bold text-[#1a1a1a] mb-2">Room Type <span className="text-red-500">*</span></label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 text-[14px] focus:ring-2 focus:ring-[#006CE4] outline-none cursor-pointer bg-white text-black"
              >
                <option value="STANDARD">Standard</option>
                <option value="DELUXE">Deluxe</option>
                <option value="SUITE">Suite</option>
              </select>
            </div>

            {/* Price and Capacity */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-[#1a1a1a] mb-2">Price per night (UAH) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full text-black border border-gray-400 rounded-sm p-3 text-[14px] focus:ring-2 focus:ring-[#006CE4] outline-none"
                  placeholder="1500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-[#1a1a1a] mb-2">Capacity (guests) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full text-black border border-gray-400 rounded-sm p-3 text-[14px] focus:ring-2 focus:ring-[#006CE4] outline-none"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-8 py-3 bg-white border border-[#006CE4] text-[#006CE4] text-[15px] font-bold hover:bg-[#ebf3ff] transition-colors rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-10 py-3 bg-[#006CE4] text-white rounded-sm text-[15px] font-bold hover:bg-[#0055b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}