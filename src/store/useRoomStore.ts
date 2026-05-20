import { create } from "zustand";
import Room from "@/src/types/Room";

interface RoomStore {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
}));
