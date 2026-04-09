"use client";

interface SettingsFormProps {
  startDate: string;
  endDate: string;
  roomStatus: string;
  roomPrice: number;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onPriceChange: (val: number) => void;
}

export default function SettingsForm({
  startDate,
  endDate,
  roomStatus,
  roomPrice,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onPriceChange,
}: SettingsFormProps) {
  return (
    <>
      {/* --- Блок дат --- */}
      <div className="p-5 border-b border-gray-200 space-y-4">
        <h3 className="font-bold text-black">Select Dates</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-black mb-1">Start date</label>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white focus-within:border-[#0071c2] focus-within:ring-1 focus-within:ring-[#0071c2]">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
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
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full outline-none text-black bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Блок статуса и цены --- */}
      <div className="p-5">
        <h4 className="font-medium text-black mb-3">Room Status for selected dates</h4>
        
        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="status" 
              value="AVAILABLE"
              checked={roomStatus === "AVAILABLE"} 
              onChange={() => onStatusChange("AVAILABLE")}
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
              onChange={() => onStatusChange("MAINTENANCE")}
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
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full px-3 py-2 outline-none text-black bg-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}