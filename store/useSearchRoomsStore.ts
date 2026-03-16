import { create } from 'zustand';
import Room from '@/types/Room';


interface SearchRoomsState {
  rooms: Room[];
  isLoading: boolean;
  error: string;
  searchDates: { checkIn: string; checkOut: string } | null; 
  numberOfPeople: number;
  
  setRooms: (rooms: Room[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setSearchDates: (dates: { checkIn: string; checkOut: string } | null) => void;
  setNumberOfPeople: (number: number) => void;
}


export const useSearchRoomsStore = create<SearchRoomsState>((set) => ({
  rooms: [],
  isLoading: false,
  error: "",
  searchDates: null,
  numberOfPeople: 1,
  
  setRooms: (rooms) => set({ rooms }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchDates: (dates) => set({ searchDates: dates }),
  setNumberOfPeople: (number) => set({ numberOfPeople: number }),
}));