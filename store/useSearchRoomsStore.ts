import { create } from 'zustand';
import Room from '@/types/Room';


interface SearchRoomsState {
  rooms: Room[];
  isLoading: boolean;
  error: string;
  searchDates: { checkIn: string; checkOut: string } | null; 
  
  // Экшены для изменения стейта
  setRooms: (rooms: Room[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setSearchDates: (dates: { checkIn: string; checkOut: string } | null) => void;
}


export const useSearchRoomsStore = create<SearchRoomsState>((set) => ({
  rooms: [],
  isLoading: false,
  error: "",
  searchDates: null,
  
  setRooms: (rooms) => set({ rooms }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchDates: (dates) => set({ searchDates: dates }),
}));