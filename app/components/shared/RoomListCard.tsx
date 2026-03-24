import Image from "next/image";
import Link from "next/link";
import Room from "@/types/Room";

export default function RoomListCard({ room }: { room: Room }) {

    const imageUrl = room.photoUrl && room.photoUrl.length > 0 ? room.photoUrl[0] : "/199685538-appareil-photo-et-icône-d-image-ou-d-image-symbole-rempli-de-galerie-d-album-et-de-photographie.jpg"; 

    const href = room.id ? `/room/${room.id}` : "#";

    return (
    <Link href={href} className="flex flex-wrap justify-end border border-gray-300 rounded-lg p-4 gap-4 md:gap-6 bg-white shadow-sm hover:shadow-md transition-shadow w-full">
      
      <div className="relative w-full md:w-[260px] h-[200px] flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={room.roomName}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1  flex flex-col justify-center ">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl   font-bold text-[#0071c2] hover:underline cursor-pointer">
            {room.roomName}
          </h2>
        </div>

        <div className="border-l-2 border-gray-200 pl-3 mt-4">
          <h3 className="font-bold text-xl text-gray-900">{room.type}</h3>
          <p className="text-lg text-gray-600 mt-1">
            Capacity: {room.capacity}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center md:w-[180px] w-full flex-shrink-0 mt-4 md:mt-0 md:pl-4 md:border-l border-gray-100">
        <div className="text-left md:text-right w-full">
          <div className="text-sm text-gray-500">1 night, {room.capacity} adults</div>
          <div className="text-2xl font-bold text-gray-900">UAH {room.price}</div>
          <div className="text-sm text-gray-500 mb-4">Including taxes and fees</div>
          
          <div className="w-full cursor-pointer bg-[#0071c2] hover:bg-[#005999] text-white font-bold py-2 px-4 rounded-sm flex items-center justify-between transition-colors">
            <span>Availability</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>

    </Link>
  );
}