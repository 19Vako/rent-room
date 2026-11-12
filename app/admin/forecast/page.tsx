import AdminHeader from "@/src/components/admin/AdminHeader";
import RoomForecastDashboard from "@/src/components/admin/RoomForecastDashboard";
import { getAllRooms } from "@/src/lib/actions/room.actions";
import type Room from "@/src/types/Room";

export default async function ForecastPage() {
  let rooms: Room[] = [];
  let hasError = false;

  try {
    const result = await getAllRooms();
    if (result.success && result.rooms) {
      rooms = result.rooms;
    } else {
      hasError = true;
    }
  } catch (error) {
    console.error("Failed to load rooms for forecast:", error);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      {!hasError ? (
        <RoomForecastDashboard rooms={rooms} />
      ) : (
        <main className="mx-auto max-w-7xl p-6">
          <p role="alert" className="text-red-700">
            Failed to load the room list.
          </p>
        </main>
      )}
    </div>
  );
}
