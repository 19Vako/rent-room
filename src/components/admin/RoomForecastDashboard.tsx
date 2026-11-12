"use client";

import { useEffect, useState } from "react";
import { getRoomForecast } from "@/src/lib/actions/forecast.actions";
import type { RoomForecast } from "@/src/lib/utils/roomForecast";
import type Room from "@/src/types/Room";

function formatAmount(amount: number): string {
  return `UAH ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function ForecastChart({ forecast }: { forecast: RoomForecast }) {
  const width = 960;
  const height = 280;
  const left = 54;
  const top = 20;
  const plotHeight = 208;
  const columnWidth = (width - left - 12) / forecast.points.length;
  const maxAmount = Math.max(
    ...forecast.points.map((point) => point.amount),
    1,
  );
  const actualCount = forecast.points.filter(
    (point) => point.kind === "actual",
  ).length;
  const dividerX = left + actualCount * columnWidth;

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="Chart of monthly confirmed booking values and forecast"
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[760px] w-full"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = top + plotHeight * (1 - fraction);
          return (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - 8}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-500 text-[10px]"
              >
                {Math.round(maxAmount * fraction).toLocaleString("en-US")}
              </text>
            </g>
          );
        })}
        {forecast.canForecast && (
          <line
            x1={dividerX}
            x2={dividerX}
            y1={top}
            y2={top + plotHeight + 20}
            stroke="#6b7280"
            strokeDasharray="4 4"
          />
        )}
        {forecast.points.map((point, index) => {
          const barHeight = (point.amount / maxAmount) * plotHeight;
          const x = left + index * columnWidth + columnWidth * 0.2;
          const barWidth = columnWidth * 0.6;
          return (
            <g key={`${point.month}-${point.kind}`}>
              <rect
                x={x}
                y={top + plotHeight - Math.max(barHeight, 1)}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                fill={point.kind === "actual" ? "#003580" : "#f59e0b"}
                opacity={point.amount === 0 ? 0.25 : 1}
                rx="2"
              >
                <title>
                  {point.label}: {formatAmount(point.amount)} (
                  {point.kind === "actual" ? "confirmed bookings" : "forecast"})
                </title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={top + plotHeight + 17}
                textAnchor="middle"
                className="fill-gray-600 text-[9px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function RoomForecastDashboard({ rooms }: { rooms: Room[] }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id.toString() ?? "");
  const [forecast, setForecast] = useState<RoomForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let isCurrentRequest = true;
    // Keep stale results out of view while a different room is loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    getRoomForecast(roomId)
      .then((result) => {
        if (!isCurrentRequest) return;
        if (result.success && result.forecast) {
          setForecast(result.forecast);
        } else {
          setForecast(null);
          setError(result.error ?? "Could not load the data.");
        }
      })
      .catch(() => {
        if (!isCurrentRequest) return;
        setForecast(null);
        setError("Could not load the data. Please try again.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [roomId]);

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Room forecast
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Monthly value of confirmed bookings and an estimate for the next three
        months.
      </p>

      <label
        htmlFor="forecast-room"
        className="mb-2 block text-sm font-semibold text-gray-800"
      >
        Select a room
      </label>
      <select
        id="forecast-room"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
        disabled={rooms.length === 0}
        className="mb-6 w-full max-w-md rounded border border-gray-300 bg-white p-3 text-gray-900"
      >
        {rooms.length === 0 ? (
          <option value="">No rooms available</option>
        ) : (
          rooms.map((room) => (
            <option key={room.id.toString()} value={room.id.toString()}>
              {room.roomName}
            </option>
          ))
        )}
      </select>

      <section
        aria-live="polite"
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        {isLoading ? (
          <p className="py-12 text-center text-gray-600">
            Loading analytics…
          </p>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-red-700">
            {error}
          </p>
        ) : !forecast ? (
          <p className="py-12 text-center text-gray-600">
            Add a room to view analytics.
          </p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#003580]" />
                Confirmed bookings
              </span>
              {forecast.canForecast && (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" />
                  Forecast
                </span>
              )}
            </div>

            {forecast.canForecast ? (
              <p className="mb-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                Profit forecasting is unavailable because the system does not
                track actual payments or expenses. This is an estimate of
                booking value only. To calculate profit, record payments and
                expenses by room and month.
              </p>
            ) : (
              <p className="mb-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                There is not enough history to generate a forecast. Confirmed
                bookings must exist in at least three of the six most recent
                complete months. Bookings do not confirm payment, and expenses
                are not tracked, so profit cannot be calculated.
              </p>
            )}

            {forecast.points.every((point) => point.amount === 0) && (
              <p className="mb-4 text-sm text-gray-600">
                No confirmed bookings were found for the selected period.
              </p>
            )}

            {forecast.ignoredOrderCount > 0 && (
              <p
                role="status"
                className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                Bookings with invalid prices or dates were excluded:{" "}
                {forecast.ignoredOrderCount}.
              </p>
            )}

            <ForecastChart forecast={forecast} />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Month
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Data type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-semibold"
                    >
                      Booking value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.points.map((point) => (
                    <tr
                      key={point.month}
                      className={`border-b border-gray-100 ${point.kind === "forecast" ? "bg-amber-50" : ""}`}
                    >
                      <th
                        scope="row"
                        className="px-3 py-2 font-medium text-gray-900"
                      >
                        {point.label}
                      </th>
                      <td className="px-3 py-2 text-gray-700">
                        {point.kind === "actual" ? "Confirmed bookings" : "Forecast"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-900">
                        {formatAmount(point.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Method: each confirmed booking value is allocated across months
              in proportion to occupied nights (the checkout date is excluded).
              Each of the next three months uses the average booking value from
              the six completed months before the current month. A forecast is
              shown only when bookings occurred in at least three of those
              months. The current, incomplete month is excluded from the
              baseline. This is an estimate of booking value, not guaranteed
              revenue or profit.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
