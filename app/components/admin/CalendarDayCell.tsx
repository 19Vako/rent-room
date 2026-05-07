"use client";
import Order from "@/types/Order";

export default function CalendarDayCell({
  day,
  firstDay,
  price,
  isSelected,
  event,
  onClick,
}: {
  day: number;
  firstDay: number;
  price?: number;
  isSelected: boolean;
  event:
    | {
        type: string;
        reason: string;
        isStart: boolean;
        isEnd: boolean;
        order?: undefined;
      }
    | {
        type: string;
        order: Order;
        isStart: boolean;
        isEnd: boolean;
        reason?: undefined;
      }
    | null;
  onClick: (day: number) => void;
}) {
  return (
    <div
      onClick={() => onClick(day)}
      className={`relative h-32 flex flex-col border-r border-b cursor-pointer transition-colors
        ${isSelected ? "bg-blue-50 border-[#003580] ring-1 ring-[#003580] z-10" : "border-gray-200 hover:bg-gray-100"}
      `}
    >
      <div className="p-2 text-sm text-black font-medium">{day}</div>

      {!event && (
        <div className="flex-1 flex flex-col items-center justify-center p-2 opacity-80">
          <span className="text-xs text-green-600 mb-1 font-medium">
            Available
          </span>
          <span className="text-sm font-semibold text-black">
            UAH {price || 0}
          </span>
        </div>
      )}

      {event && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-0 flex px-0">
          <div
            className={`h-7 flex items-center text-white text-xs whitespace-nowrap overflow-hidden
              ${event.type === "ORDER" ? "bg-[#0071c2]" : "bg-red-500"} 
              ${event.isStart ? "ml-2 rounded-l" : ""}
              ${event.isEnd ? "mr-2 rounded-r " : ""}
              w-full
            `}
          >
            {/* Текст внутри плашки */}
            {(event.isStart || (day - 1 + firstDay) % 7 === 0) && (
              <span className="px-2 font-medium">
                {event.type === "ORDER" ? "Booked" : "Closed"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
