import { getRoomById } from "@/src/lib/actions/room.actions";
import EditRoomForm from "../../../../src/components/admin/EditRoomForm";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { success, room, error } = await getRoomById(resolvedParams.id);

  if (!success || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">
          Error: {error || "Room not found"}
        </h1>
        <a href="/admin" className="mt-4 text-blue-600 underline">
          Back to Admin
        </a>
      </div>
    );
  }

  return <EditRoomForm initialRoom={room} />;
}
