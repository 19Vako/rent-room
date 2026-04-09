"use client";

export default function CalendarHeader({ monthName, year, onPrevMonth, onNextMonth }: { monthName: string; year: number; onPrevMonth: () => void; onNextMonth: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4 bg-white p-4 border border-gray-200 shadow-sm">
      <button onClick={onPrevMonth} className="px-4 py-2 border rounded hover:bg-gray-50 text-black font-medium">
        &larr; Prev
      </button>
      <h2 className="text-xl font-bold text-black">{monthName} {year}</h2>
      <button onClick={onNextMonth} className="px-4 py-2 border rounded hover:bg-gray-50 text-black font-medium">
        Next &rarr;
      </button>
    </div>
  );
}