"use client";
import { useState } from "react";
import { getAvailableRooms } from "@/lib/actions/order.actions";
import { useSearchRoomsStore } from "@/store/useSearchRoomsStore"; 

export default function SearchWidget() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const { setRooms, setIsLoading, setError, setNumberOfPeople, setSearchDates, searchDates, isLoading } = useSearchRoomsStore();

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("Check-out date must be later than check-in date.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRooms([]);
    setSearchDates({ checkIn, checkOut });
    setNumberOfPeople(guests); 

    try {
      const result = await getAvailableRooms(new Date(checkIn), new Date(checkOut), guests);

      if (result.success && result.rooms) {
        setRooms(result.rooms);
      } else {
        setError(result.error || "Failed to find rooms.");
      }
    } catch (err) {
      console.error(err);
      setError("A system error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-[#febb02] p-1 rounded shadow-lg flex flex-wrap md:flex-nowrap gap-1 w-full max-w-6xl mx-auto">
        <div className="flex flex-wrap md:flex-nowrap flex-1 bg-white rounded-sm divide-x divide-black/10">
          
          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px]">
            <input 
              type="date" 
              className="w-full py-2   outline-none bg-transparent"
              value={searchDates?.checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px]">
            <input 
              type="date" 
              className="w-full py-2 outline-none bg-transparent"
              value={searchDates?.checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className="flex flex-1 items-center px-4 py-2 min-w-[150px] md:max-w-[250px]">
            <select 
              className="w-full py-2  outline-none bg-transparent"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} guests</option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-[#0071c2] hover:bg-[#005999] disabled:bg-blue-300 text-white text-xl font-bold py-3 px-8 rounded-sm transition-colors duration-200 shrink-0 w-full md:w-auto flex justify-center items-center"
        >
          {isLoading ? "Finding..." : "Find"}
        </button>
      </div>
    </div>
  )
}