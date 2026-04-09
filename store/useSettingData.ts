import { create } from 'zustand';
import Room from '@/types/Room';

export const getTodayFormatted = () => new Date().toISOString().split("T")[0];

interface SettingData {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room) => void;
}

export const useSettingData = create<SettingData>()((set) => ({
    startDate: getTodayFormatted(),
    setStartDate: (date:string) => set({ startDate: date }),
    endDate: getTodayFormatted(),
    setEndDate: (date:string) => set({ endDate: date }),
    selectedRoom: null,
    setSelectedRoom: (room) => set({ selectedRoom: room }),
}))