"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Room from "@/src/types/Room";
import BackButton from "../shared/BackButton";
import EditRoomPhotos from "./EditRoomPhotos";
import { updateRoom, deleteRoom } from "@/src/lib/actions/room.actions";

export default function EditRoomForm({ initialRoom }: { initialRoom: Room }) {
  const router = useRouter();

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<
    Pick<Room, "roomName" | "type" | "capacity" | "price" | "description">
  >({
    roomName: initialRoom.roomName,
    type: initialRoom.type,
    capacity: initialRoom.capacity,
    price: initialRoom.price,
    description: initialRoom.description,
  });

  const [initialData, setInitialData] = useState(formData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isChanged =
      formData.roomName !== initialData.roomName ||
      formData.type !== initialData.type ||
      Number(formData.capacity) !== Number(initialData.capacity) ||
      Number(formData.price) !== Number(initialData.price) ||
      formData.description !== initialData.description;

    setHasChanges(isChanged);
  }, [formData, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await updateRoom(initialRoom.id as string, formData);

      setMessage({
        type: "success",
        text: "Room settings saved successfully!",
      });
      setInitialData(formData);
      setHasChanges(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Error updating room." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setMessage(null);
    try {
      const result = await deleteRoom(initialRoom.id as string);

      if (result.success) {
        router.push("/admin");
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to delete room.",
        });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-[#003580] text-white px-6 py-4 flex items-center shadow-md fixed top-0 w-full z-50">
          <BackButton className="text-white" />
        </div>

        <main className="max-w-6xl mx-auto px-4 pt-28">
          <div className="mb-6">
            <input
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              placeholder="Room Name"
              className="text-4xl font-bold text-gray-900 w-full border-b-2 border-transparent hover:border-gray-200 focus:border-[#0071c2] transition-colors outline-none bg-transparent pb-1"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <EditRoomPhotos initialRoom={initialRoom} />

            <div className="flex-1 flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
              {/* НАСТРОЙКИ КОМНАТЫ */}
              <div className="border border-gray-200 bg-white p-6 rounded shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-gray-900">
                  Room Settings
                </h2>

                <div className="space-y-5">
                  {/* TYPE */}
                  <div>
                    <label className="block text-[14px] font-bold text-gray-900 mb-1">
                      Apartment type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2.5 rounded text-[14px] focus:border-[#0071c2] focus:ring-1 focus:ring-[#0071c2] outline-none bg-white transition-colors"
                    >
                      <option value="STANDARD">Standard Room</option>
                      <option value="DELUXE">Deluxe Room</option>
                      <option value="SUITE">Suite</option>
                    </select>
                    <p className="text-[12px] text-gray-500 mt-1">
                      This is the category guests will see on the website.
                    </p>
                  </div>

                  {/* CAPACITY */}
                  <div>
                    <label className="block text-[14px] font-bold text-gray-900 mb-1">
                      Maximum capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full border text-black border-gray-300 p-2.5 rounded text-[14px] focus:border-[#0071c2] focus:ring-1 focus:ring-[#0071c2] outline-none transition-colors"
                    />
                    <p className="text-[12px] text-gray-500 mt-1">
                      Number of guests this room can accommodate.
                    </p>
                  </div>

                  {/* PRICE */}
                  <div>
                    <label className="block text-[14px] font-bold text-gray-900 mb-1">
                      Base price (UAH)
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2.5 rounded text-[#0071c2] font-bold text-lg focus:border-[#0071c2] focus:ring-1 focus:ring-[#0071c2] outline-none transition-colors"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="block text-[14px] font-bold text-gray-900 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 p-2.5 rounded text-black text-[14px] focus:border-[#0071c2] focus:ring-1 focus:ring-[#0071c2] outline-none transition-colors resize-none"
                      rows={4}
                      placeholder="Describe your room amenities and features..."
                    />
                    <p className="text-[12px] text-gray-500 mt-1">
                      Tell guests what makes your room special.
                    </p>
                  </div>

                  {/* MESSAGE BOX */}
                  {message && (
                    <div
                      className={`p-3 rounded text-[14px] ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  {/* SAVE BUTTON */}
                  {hasChanges && (
                    <div className="pt-2 animate-in fade-in duration-300">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full bg-[#0071c2] text-white font-bold py-3 rounded hover:bg-[#005999] transition-colors disabled:opacity-70 flex justify-center items-center"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DANGER ZONE (УДАЛЕНИЕ) */}
              <div className="border border-red-200 bg-red-50 p-6 rounded shadow-sm">
                <h2 className="text-lg font-bold mb-2 text-red-800">
                  Danger Zone
                </h2>
                <p className="text-[13px] text-red-600 mb-4">
                  Once you delete a room, there is no going back. Please be
                  certain.
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full bg-white text-red-600 font-bold py-3 rounded border border-red-200 hover:bg-red-100 transition-colors"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL WINDOW */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Room?
            </h3>
            <p className="text-gray-600 mb-6 text-[14px]">
              Are you sure you want to delete{" "}
              <span className="font-bold">{initialRoom.roomName}</span>? This
              action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-[14px] font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px]"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
