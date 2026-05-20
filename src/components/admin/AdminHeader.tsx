import Link from "next/link";
import { getAllRooms } from "@/src/lib/actions/room.actions";
import AdminRoomSelector from "./AdminRoomSelector";
import OrdersModalButton from "./OrdersModalButton";

export default async function AdminHeader() {
  const { success, rooms } = await getAllRooms();

  return (
    <header className="bg-[#003580] border-b border-blue-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap sm:flex-row justify-between items-center min-h-[4rem] py-2 sm:py-0 gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link
              href="/admin"
              className="text-xl sm:text-2xl font-bold text-white hover:text-blue-200 transition-colors"
            >
              RentRoom
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {success && rooms && rooms.length > 0 && (
                <AdminRoomSelector rooms={rooms} />
              )}
              <OrdersModalButton />
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <Link
              href="/"
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold text-white border border-blue-white rounded hover:bg-[#0071c2] transition-all text-center whitespace-nowrap"
            >
              Guest Mode
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
