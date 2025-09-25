import { create } from "zustand";
import { GuestCount, RoomBooking } from "./types/booking";
import { differenceInDays } from "date-fns";
import { Hotel } from "../hotel/domain";

interface BookingStore {
  selectedHotel?: Hotel;
  guestCount: GuestCount;
  roomCount: number;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalGuests: number;
  selectedRoomBookings: RoomBooking[];

  // Actions
  setSelectedHotel: (hotel: Hotel | undefined) => void;
  updateAdults: (increment: boolean) => void;
  updateChildren: (increment: boolean) => void;
  updateRoomAmount: (increment: "increment" | "decrement") => void;
  setGuestCount: (guestCount: GuestCount) => void;
  setCheckInDate: (date: Date | undefined) => void;
  setCheckOutDate: (date: Date | undefined) => void;
  setSelectedRoomBookings: (rooms: RoomBooking[] | undefined) => void;
  addRoom: (room: RoomBooking) => void;
  removeRoomAtIndex: (index: number) => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  selectedHotel: undefined,
  guestCount: { adults: 1, children: 0 },
  checkInDate: undefined,
  checkOutDate: undefined,
  selectedRoomBookings: [],
  roomCount: 1,

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
  setSelectedRoomBookings: (rooms: RoomBooking[] | undefined) =>
    set({ selectedRoomBookings: rooms }),
  addRoom: (room: RoomBooking) => {
    set((state) => ({
      selectedRoomBookings: [...state.selectedRoomBookings, room],
    }));
  },
  removeRoomAtIndex: (index: number) => {
    set((state) => ({
      selectedRoomBookings: state.selectedRoomBookings.filter(
        (_, i) => i !== index,
      ),
    }));
  },
  updateRoomAmount: (increment: "increment" | "decrement") => {
    set((state) => ({
      roomCount:
        increment === "increment" ? state.roomCount + 1 : state.roomCount - 1,
    }));
  },
}));
