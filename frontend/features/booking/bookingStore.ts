import { create } from "zustand";
import { Hotel } from "../hotels/types/Hotel";
import { GuestCount } from "./types/booking";
import { AvailableRoom } from "./services/bookingService";
import { differenceInDays } from "date-fns";

interface BookingStore {
  selectedHotel?: Hotel;
  guestCount: GuestCount;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalGuests: number;
  selectedRoom?: AvailableRoom;

  // Actions
  setSelectedHotel: (hotel: Hotel | undefined) => void;
  updateAdults: (increment: boolean) => void;
  updateChildren: (increment: boolean) => void;
  setGuestCount: (guestCount: GuestCount) => void;
  setCheckInDate: (date: Date | undefined) => void;
  setCheckOutDate: (date: Date | undefined) => void;
  setSelectedRoom: (room: AvailableRoom | undefined) => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  selectedHotel: undefined,
  guestCount: { adults: 1, children: 0 },
  checkInDate: undefined,
  checkOutDate: undefined,
  selectedRoom: undefined,

  get totalGuests() {
    const state = get();
    return state.guestCount.adults + state.guestCount.children;
  },

  setSelectedHotel: (hotel: Hotel | undefined) => set({ selectedHotel: hotel }),
  updateAdults: (increment: boolean) => {
    set((state) => ({
      guestCount: {
        ...state.guestCount,
        adults: increment
          ? state.guestCount.adults + 1
          : state.guestCount.adults - 1,
      },
    }));
  },
  updateChildren: (increment: boolean) => {
    set((state) => ({
      guestCount: {
        ...state.guestCount,
        children: increment
          ? state.guestCount.children + 1
          : state.guestCount.children - 1,
      },
    }));
  },
  setGuestCount: (guestCount: GuestCount) => set({ guestCount }),
  setCheckInDate: (date: Date | undefined) => set({ checkInDate: date }),
  setCheckOutDate: (date: Date | undefined) => set({ checkOutDate: date }),
  setSelectedRoom: (room: Room | undefined) => set({ selectedRoom: room }),
}));
