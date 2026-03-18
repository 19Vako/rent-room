import { create } from 'zustand';
import Room from '@/types/Room';


interface SearchRoomsState {
  rooms: Room[];
  isLoading: boolean;
  error: string;
  searchDates: { checkIn: string; checkOut: string } | null; 
  numberOfPeople: number;
  priceRange: { min: number; max: number } | null;
  
  setRooms: (rooms: Room[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setSearchDates: (dates: { checkIn: string; checkOut: string }) => void;
  setNumberOfPeople: (number: number) => void;
  setPriceRange: (range: { min: number; max: number } | null) => void;
}


export const useSearchRoomsStore = create<SearchRoomsState>((set) => ({
  rooms: [],
  isLoading: false,
  error: "",
  searchDates: null,
  numberOfPeople: 1,

  priceRange: { min: 0, max: 10000 },
  
  
  setRooms: (rooms) => set({ rooms }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchDates: (dates) => set({ searchDates: dates }),
  setNumberOfPeople: (number) => set({ numberOfPeople: number }),
  setPriceRange: (range) => set({ priceRange: range }),
}));