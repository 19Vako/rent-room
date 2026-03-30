"use client";

import { useState } from "react";
import { useSearchRoomsStore } from "@/store/useSearchRoomsStore";
import { calculateOrderDetails } from "@/lib/utils/calculateOrder";
import { createOrder } from "@/lib/actions/order.actions"; 
import Room from "@/types/Room";


export default function BookingPanel({ room }: { room: Room }) {
 
  const { searchDates, numberOfPeople } = useSearchRoomsStore();
  const { totalPrice, nights } = calculateOrderDetails(room.price, searchDates);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBooking = async () => {
    if (!searchDates?.checkIn || !searchDates?.checkOut) return;

    setIsLoading(true);
    setMessage(null);

    try {

      const response = await createOrder(
        room.id as string,
        searchDates.checkIn,
        searchDates.checkOut,
        totalPrice,
        numberOfPeople
      );

     
      if (response.success) {
        setMessage({ type: "success", text: "The room has been successfully booked." });
      } else {
        setMessage({ type: "error", text: response.error || "Failed to book the room." });
      }
    } catch (error) {
      console.error("Error booking room:", error);
      setMessage({ type: "error", text: "Something went wrong. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-[35%] flex flex-col gap-6 flex-shrink-0">
           
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">About room</h2>
             
              <div className="flex flex-col gap-3">
                <span className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-sm text-sm font-semibold border border-gray-200">
                  Type: {room.type}
                </span>
                <span className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-sm text-sm font-semibold border border-gray-200">
                  Capacity: up to {room.capacity} guests
                </span>
                <span className={`px-4 py-2.5 rounded-sm text-sm font-semibold border ${
                  room.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  Status: {room.status}
                </span>
              </div>
            </div>

  <div className="flex flex-col mb-6">
    <div className="text-sm text-gray-600 font-medium mb-1">
      Price for {nights} night{nights !== 1 ? "s" : ""}
    </div>
    
    <div className="text-3xl font-extrabold text-[#0071c2]">
      UAH {totalPrice.toLocaleString('uk-UA')}
    </div>
    
    <div className="text-xs text-gray-500 mt-1.5 font-medium">
      Including taxes and fees
    </div>
  </div>

  {message && (
          <div className={`p-3 rounded-md text-sm mb-4 font-medium ${
            message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}
              
    <button 
          onClick={handleBooking}
          disabled={!nights || nights <= 0 || isLoading || message?.type === "success"}
          className="w-full bg-[#0071c2] hover:bg-[#005999] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-sm transition-colors text-center shadow-md flex justify-center items-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          ) : nights > 0 ? (
            'Book Now'
          ) : (
            'Select dates'
          )}
        </button>

    </div>
  );
}