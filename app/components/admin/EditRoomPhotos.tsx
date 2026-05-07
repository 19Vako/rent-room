"use client";

import { useState } from "react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton } from "@uploadthing/react";
import Room from "@/types/Room";
import { addRoomImage, removeRoomImage } from "@/lib/actions/room.actions";

export default function EditRoomPhotos({ initialRoom }: { initialRoom: Room }) {
  const [photos, setPhotos] = useState<string[]>(initialRoom.photoUrl || []);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, i) => i !== indexToRemove);
    removeRoomImage(initialRoom.id as string, photos[indexToRemove]);
    setPhotos(updated);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
      <h2 className="text-xl font-bold text-gray-900">
        Main gallery ({photos.length} photos)
      </h2>

      <div className="flex justify-between items-center border-y border-gray-200 py-3">
        <div className="relative overflow-hidden bg-[#0071c2] text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-[#005999] transition-colors cursor-pointer">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Add photos
          {/* Невидимый слой UploadThing поверх синей кнопки */}
          <div className="absolute inset-0 z-10 opacity-0 [&_button]:w-full [&_button]:h-full [&_label]:w-full [&_label]:h-full cursor-pointer">
            <UploadButton<OurFileRouter, "roomImage">
              endpoint="roomImage"
              onClientUploadComplete={async (res) => {
                if (res && res.length > 0) {
                  const uploadedUrl = res[0].url;
                  await addRoomImage(initialRoom.id as string, uploadedUrl);
                  const updatedPhotos = [...photos, uploadedUrl];
                  setPhotos(updatedPhotos);
                  setMessage({
                    type: "success",
                    text: "Image uploaded successfully!",
                  });
                  setTimeout(() => setMessage(null), 3000);
                }
              }}
              onUploadError={(error: Error) => {
                setMessage({
                  type: "error",
                  text: `Upload failed: ${error.message}`,
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded overflow-hidden border border-gray-200 group bg-gray-100"
          >
            <img
              src={url}
              alt={`Room photo ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* БЕЙДЖ: Preferred main photo */}
            {i === 0 && (
              <div className="absolute top-0 left-0 bg-[#f58220] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br z-10 shadow-sm">
                Preferred main photo
              </div>
            )}

            {/* КНОПКА УДАЛЕНИЯ ПРИ НАВЕДЕНИИ */}
            <button
              onClick={() => handleRemovePhoto(i)}
              className="absolute bottom-2 right-2 bg-white p-1.5 rounded shadow-md text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              title="Delete photo"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        ))}

        <div className="relative aspect-square border-2 border-gray-200 rounded flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors group">
          <div className="flex flex-col items-center justify-center text-[#0071c2] pointer-events-none z-0">
            <svg
              className="w-6 h-6 mb-1 text-gray-400 group-hover:text-[#0071c2] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <span className="font-medium text-[13px]">Add photos</span>
          </div>

          <UploadButton<OurFileRouter, "roomImage">
            endpoint="roomImage"
            appearance={{
              container: "absolute inset-0 z-10 w-full h-full m-0",
              button: "w-full h-full opacity-0 cursor-pointer",
              allowedContent: "hidden",
            }}
            onClientUploadComplete={async (res) => {
              if (res && res.length > 0) {
                const uploadedUrl = res[0].url;
                await addRoomImage(initialRoom.id as string, uploadedUrl);
                const updatedPhotos = [...photos, uploadedUrl];
                setPhotos(updatedPhotos);
                setMessage({
                  type: "success",
                  text: "Image uploaded successfully!",
                });
                setTimeout(() => setMessage(null), 3000);
              }
            }}
            onUploadError={(error: Error) => {
              setMessage({
                type: "error",
                text: `Upload failed: ${error.message}`,
              });
            }}
          />
        </div>
      </div>

      {/* ВЫВОД СООБЩЕНИЙ ОБ УСПЕХЕ/ОШИБКЕ */}
      {message && (
        <div
          className={`mt-2 p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
