import Link from "next/link";
import { getAllRooms } from "@/lib/actions/room.actions";  
import AdminRoomSelector from "./AdminRoomSelector";

export default async function AdminHeader() {

  const { success, rooms } = await getAllRooms();

  return (
    <header className="bg-[#003580] border-b border-[#002255] z-50 relative">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
 
          <Link href="/admin" className="text-2xl font-bold text-white tracking-tight">
             RentRoom
          </Link>

          {success && rooms && rooms.length > 0 && (
            <AdminRoomSelector rooms={rooms} />
          )}
        </div>

    
      </div>
    </header>
  );
}