import Image from "next/image";
import Link from "next/link";
import Header from "../../components/shared/Header";  

export default async function RoomPage({ params, searchParams }: { params: { id: string }; searchParams: { checkIn?: string; checkOut?: string } }) {
 
  const room = {
    id: params.id,
    roomName: "Lux na Druhetiv",
    type: "DELUXE",
    price: 13086,
    capacity: 2,
    status: "AVAILABLE",
    photoUrl: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1582719478250-c89d14c77345?q=80&w=2070&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop", 
    ],
  };

  const photos = room.photoUrl?.length > 0 ? room.photoUrl : ["/placeholder.jpg"];

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pt-28">
        
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">{room.roomName}</h1>
        </div>

    
        <div className="flex flex-wrap lg:flex-row gap-8 w-full">
          
          
          <div className="flex-1 flex flex-col gap-2 w-full">
            
            
            <div className="flex w-full h-[300px] md:h-[450px]">
              
              
              <div className="relative w-full h-full rounded-l-lg overflow-hidden group cursor-pointer">
                <Image src={photos[0]} alt="Main photo" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              
              <div className="hidden md:flex flex-col gap-2 w-1/3 h-full">
                <div className="relative h-[calc(50%-4px)] rounded-tr-lg overflow-hidden group cursor-pointer bg-gray-100">
                  {photos[1] && <Image src={photos[1]} alt="Photo 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="relative h-[calc(50%-4px)] rounded-br-lg overflow-hidden group cursor-pointer bg-gray-100">
                  {photos[2] && <Image src={photos[2]} alt="Photo 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
              </div>

            </div>

            
            {photos.length > 3 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 h-[80px] md:h-[100px]">
                {photos.slice(3, 8).map((url, index) => (
                  <div key={index} className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 cursor-pointer">
                    <Image src={url} alt={`Thumbnail ${index + 4}`} fill className="object-cover" />
                    {index === 4 && photos.length > 8 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                        +{photos.length - 8} фото
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

       
          <div className="w-full lg:w-[35%] flex flex-col gap-6 flex-shrink-0">
            
           
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">About room</h2>
              
             
              <div className="flex flex-col gap-3">
                <span className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-sm text-sm font-semibold border border-gray-200">
                  Type: {room.type}
                </span>
                <span className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-sm text-sm font-semibold border border-gray-200">
                  Capacity: up to {room.capacity} guests
                </span>
                <span className={`px-4 py-2.5 rounded-sm text-sm font-semibold border ${
                  room.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" 
                  : room.status === "BOOKED" ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  Status: {room.status}
                </span>
              </div>
            </div>

           
        <div className="bg-[#ebf3ff] p-6 rounded-lg border border-[#cce1ff]">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Booking Details</h3>

                <div className="mb-6">
                <div className="text-3xl font-extrabold text-[#0071c2]">
                  UAH {room.price}
                </div>
                <div className="text-xs text-gray-500 mt-1">Including taxes and fees</div>
                </div>
              
                <button className="w-full bg-[#0071c2] hover:bg-[#005999] text-white font-bold py-3.5 px-4 rounded-sm transition-colors text-center shadow-md">
                Book Now
                </button>
        </div>

          </div>
        </div>

      </main>
    </div>
  );
}