import Link from "next/link";
import { getAllRooms } from "@/lib/actions/room.actions";
import AdminRoomSelector from "./AdminRoomSelector";
import OrdersModalButton from "./OrdersModalButton";

export default async function AdminHeader() {
  const { success, rooms } = await getAllRooms();

  return (
    <header className="bg-[#003580] border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/admin" className="text-2xl mr-4 font-bold text-white">
              RentRoom
            </Link>

            {success && rooms && rooms.length > 0 && (
              <div className="w-full sm:w-auto mr-4 flex justify-center">
                <AdminRoomSelector rooms={rooms} />
              </div>
            )}
            <OrdersModalButton />
          </div>

          {/* 3. Кнопки справа (На телефонах остаются вверху справа - order-2, на ПК - md:order-3) */}
          <div className="flex items-center justify-end gap-3 md:gap-4 shrink-0 order-2 md:order-3">
            <Link
              href="/"
              className=" px-4 py-2 text-sm  font-bold text-white border border-[#0071c2] rounded hover:bg-blue-800 transition-colors text-center whitespace-nowrap"
            >
              Back to guest mode
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
