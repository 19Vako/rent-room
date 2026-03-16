import Header from "../../components/shared/Header";  
import BookingPanel from "@/app/components/shared/BookingPanel";
import { getRoomById } from "@/lib/actions/room.actions";
import ImageSlider from "@/app/components/shared/ImageSlider";
import BackButton from "@/app/components/shared/BackButton";

export default async function RoomPage({ params }: { params: Promise<{ id: string }>}) {

  const resolvedParams = await params;
  const { room } = await getRoomById(resolvedParams.id)
  const photos = room!.photoUrl

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-20">
        <BackButton className="mb-4" />
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">{room!.roomName}</h1>
        </div>
        <div className="flex flex-wrap lg:flex-row gap-8 w-full">
      
          <div className="flex-1 flex flex-col gap-2 w-full">
            <ImageSlider photos={photos} />            
          </div>
          <BookingPanel room={room!} />
        </div>

      </main>
    </div>
  );
}