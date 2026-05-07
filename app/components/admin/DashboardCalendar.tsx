"use client";

import { useState, useEffect } from "react";
import SetUpDates from "./SetUpDates";
import CalendarHeader from "./CalendarHeader";
import CalendarDayCell from "./CalendarDayCell";
import { useSettingData } from "@/store/useSettingData";
import Order from "@/types/Order";
import { getRoomCalendarEvents } from "@/lib/actions/room.actions";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const formatDate = (year: number, month: number, day: number) => {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
};

export default function DashboardCalendar() {
  const { selectedRoom, startDate, endDate, setStartDate, setEndDate } =
    useSettingData();

  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [orders, setOrders] = useState<Order[]>([]);
  const [blockedDates, setBlockedDates] = useState<
    { startDate: string; endDate: string; reason: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      if (!selectedRoom?.id) return;
      setIsLoading(true);
      const res = await getRoomCalendarEvents(selectedRoom.id.toString());
      if (res.success && res.orders && res.blockedDates) {
        setOrders(res.orders);
        setBlockedDates(res.blockedDates);
      }
      setIsLoading(false);
    }
    if (isMounted) fetchEvents();
  }, [selectedRoom, isMounted]);

  if (!isMounted) {
    return (
      <div className="flex flex-wrap items-start gap-6 w-full max-w-[1600px] mx-auto p-4 bg-white min-h-screen">
        <div className="flex-1 w-full flex items-center justify-center">
          <span className="text-black font-medium">Loading calendar...</span>
        </div>
      </div>
    );
  }

  const YEAR = currentDate.getFullYear();
  const MONTH = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const firstDay = getFirstDayOfMonth(YEAR, MONTH);

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day: number) => {
    const clickedDateStr = formatDate(YEAR, MONTH, day);

    if (startDate === endDate) {
      if (clickedDateStr < startDate) {
        setStartDate(clickedDateStr);
        setEndDate(clickedDateStr);
      } else {
        setEndDate(clickedDateStr);
      }
    } else {
      setStartDate(clickedDateStr);
      setEndDate(clickedDateStr);
    }
  };

  const getEventForDay = (day: number) => {
    const currentDayTime = new Date(YEAR, MONTH, day).setHours(0, 0, 0, 0);

    for (const block of blockedDates) {
      const startStr = block.startDate.split("T")[0];
      const endStr = block.endDate.split("T")[0];
      const start = new Date(`${startStr}T00:00:00`).setHours(0, 0, 0, 0);
      const end = new Date(`${endStr}T00:00:00`).setHours(0, 0, 0, 0);

      if (currentDayTime >= start && currentDayTime <= end) {
        return {
          type: "BLOCKED",
          reason: block.reason,
          isStart: currentDayTime === start,
          isEnd: currentDayTime === end,
        };
      }
    }

    for (const order of orders) {
      const startStr = order.checkInDate.toString().split("T")[0];
      const endStr = order.checkOutDate.toString().split("T")[0];
      const start = new Date(`${startStr}T00:00:00`).setHours(0, 0, 0, 0);
      const end = new Date(`${endStr}T00:00:00`).setHours(0, 0, 0, 0);

      if (currentDayTime >= start && currentDayTime <= end) {
        return {
          type: "ORDER",
          order,
          isStart: currentDayTime === start,
          isEnd: currentDayTime === end,
        };
      }
    }
    return null;
  };

  return (
    <div className="flex flex-wrap items-start gap-6 w-full max-w-[1600px] mx-auto p-4">
      <div className="flex-1 w-full overflow-x-auto">
        <CalendarHeader
          monthName={currentDate.toLocaleString("default", { month: "long" })}
          year={YEAR}
          onPrevMonth={() => setCurrentDate(new Date(YEAR, MONTH - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(YEAR, MONTH + 1, 1))}
        />

        <div className="min-w-[800px] border-t border-l border-gray-200 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center">
              <span className="text-black font-medium text-lg bg-white px-4 py-2 rounded shadow">
                Loading events...
              </span>
            </div>
          )}

          <div className="grid grid-cols-7 bg-white">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="py-2 px-3 border-r border-b border-gray-200 text-sm text-gray-700 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-[#f7f7f7]">
            {blanks.map((blank) => (
              <div
                key={`blank-${blank}`}
                className="h-32 border-r border-b border-gray-200 bg-gray-50"
              ></div>
            ))}

            {days.map((day) => {
              const currentDateStr = formatDate(YEAR, MONTH, day);

              const isSelected =
                currentDateStr >= startDate && currentDateStr <= endDate;

              return (
                <CalendarDayCell
                  key={day}
                  day={day}
                  firstDay={firstDay}
                  price={selectedRoom?.price}
                  isSelected={isSelected}
                  event={getEventForDay(day)}
                  onClick={() => handleDayClick(day)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <SetUpDates />
    </div>
  );
}
