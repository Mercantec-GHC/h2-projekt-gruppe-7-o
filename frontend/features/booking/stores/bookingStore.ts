import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { immer } from "zustand/middleware/immer";

import { Hotel } from "../../hotel/domain";
import { GuestCount, RoomBooking } from "../domain";
import { RoomType } from "../api/dto";
import { differenceInDays } from "date-fns";
import { CONSTANTS } from "@/lib/constants";
import { useMemo } from "react";

export type SelectedRoomBookings = Record<RoomType, RoomBooking[]>;

// Helper function to initialize selectedRoomBookings dynamically
const createEmptyRoomBookings = (): SelectedRoomBookings => {
  const roomTypes: RoomType[] = CONSTANTS.ROOM_TYPES;
  return roomTypes.reduce((acc, roomType) => {
    acc[roomType] = [];
    return acc;
  }, {} as SelectedRoomBookings);
};

interface BookingBreakdown {
  rooms: RoomTypeBreakdown[];
  nights: number;
  total: number;
}

interface RoomTypeBreakdown {
  type: RoomType;
  amountOfBookings: number;
  pricePerNight: number;
  totalPerNight: number;
  totalPrice: number;
}

interface BookingStore {
  selectedHotel?: Hotel;
  guestCount: GuestCount;
  selectedRoomCount: number;
  checkInDate?: Date;
  checkOutDate?: Date;
  selectedRoomBookings: SelectedRoomBookings;
  actions: BookingStoreActions;
}

interface BookingStoreActions {
  setSelectedHotel: (hotel: Hotel | undefined) => void;
  updateAdults: (update: "increment" | "decrement") => void;
  updateChildren: (increment: boolean) => void;
  updateRoomAmount: (update: "increment" | "decrement") => void;
  updateRoomGuests: (
    roomType: RoomType,
    roomIndex: number,
    guestType: "adults" | "children",
    update: "increment" | "decrement",
  ) => void;
  setGuestCount: (guestCount: GuestCount) => void;
  setCheckInDate: (date: Date | undefined) => void;
  setCheckOutDate: (date: Date | undefined) => void;
  addRoom: (room: RoomBooking) => void;
  removeRoom: (roomType: RoomType) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>()(
  immer((set) => ({
    selectedHotel: undefined,
    guestCount: { adults: 1, children: 0 },
    checkInDate: undefined,
    checkOutDate: undefined,
    selectedRoomBookings: createEmptyRoomBookings(),
    selectedRoomCount: 1,
    actions: {
      setSelectedHotel: (hotel: Hotel | undefined) =>
        set({ selectedHotel: hotel }),
      updateAdults: (update: "increment" | "decrement") => {
        set((state) => {
          state.guestCount.adults += update === "increment" ? 1 : -1;
        });
      },
      updateChildren: (increment: boolean) => {
        set((state) => {
          state.guestCount.children += increment ? 1 : -1;
        });
      },
      setGuestCount: (guestCount: GuestCount) => set({ guestCount }),
      setCheckInDate: (date: Date | undefined) => set({ checkInDate: date }),
      setCheckOutDate: (date: Date | undefined) => set({ checkOutDate: date }),
      addRoom: (room: RoomBooking) => {
        set((state) => {
          // a room should always have 1 adult
          const roomWithMinAdults = {
            ...room,
            adults: Math.max(room.adults, 1),
          };
          state.selectedRoomBookings[room.type].push(roomWithMinAdults);
        });
      },
      removeRoom: (roomType: RoomType) => {
        set((state) => {
          state.selectedRoomBookings[roomType].pop();
        });
      },

      updateRoomAmount: (update: "increment" | "decrement") => {
        set((state) => {
          state.selectedRoomCount += update === "increment" ? 1 : -1;
        });
      },
      //TODO: not sure about this lol, I (karl) might have been overcomplicating this entire store tbh...
      updateRoomGuests: (
        roomType: RoomType,
        roomIndex: number,
        guestType: "adults" | "children",
        update: "increment" | "decrement",
      ) => {
        set((state) => {
          if (guestType === "adults") {
            state.selectedRoomBookings[roomType][roomIndex].adults =
              update === "increment"
                ? state.selectedRoomBookings[roomType][roomIndex].adults + 1
                : state.selectedRoomBookings[roomType][roomIndex].adults - 1;
          } else {
            state.selectedRoomBookings[roomType][roomIndex].children =
              update === "increment"
                ? state.selectedRoomBookings[roomType][roomIndex].children + 1
                : state.selectedRoomBookings[roomType][roomIndex].children - 1;
          }
        });
      },
      reset: () => {
        set({
          selectedHotel: undefined,
          guestCount: { adults: 1, children: 0 },
          checkInDate: undefined,
          checkOutDate: undefined,
          selectedRoomBookings: createEmptyRoomBookings(),
          selectedRoomCount: 1,
        });
      },
    },
  })),
);

// export each member as individual hooks. This gives us more control over the state and prevents unnecessary renders in the frontend, that would happen if we used the entire store hook.
export const useSelectedHotel = () =>
  useBookingStore((state) => state.selectedHotel);

export const useGuestCount = () => useBookingStore((state) => state.guestCount);

export const useRoomCount = () =>
  useBookingStore((state) => state.selectedRoomCount);

export const useNightsCount = () =>
  useBookingStore((state) => {
    if (!state.checkInDate || !state.checkOutDate) return null;

    return differenceInDays(state.checkOutDate, state.checkInDate);
  });

export const useCanSearch = () =>
  useBookingStore((state) => {
    const selectedHotel = state.selectedHotel;
    const checkInDate = state.checkInDate;
    const checkOutDate = state.checkOutDate;
    const selectedRoomCount = state.selectedRoomCount;
    const guestCount = state.guestCount;

    const dateIsValid =
      checkInDate && checkOutDate && checkInDate < checkOutDate;
    const roomCountIsValid = selectedRoomCount > 0;
    const hasAtleastOneAdult = guestCount.adults > 0;

    return (
      selectedHotel !== undefined &&
      dateIsValid &&
      roomCountIsValid &&
      hasAtleastOneAdult
    );
  });

// Simple hook to get total selected rooms - this is what you actually needed
export const useTotalSelectedRooms = () =>
  useBookingStore((state) => {
    return Object.values(state.selectedRoomBookings).reduce(
      (total, bookings) => total + bookings.length,
      0,
    );
  });

// Validate if selected rooms match initial room count
export const useSelectedRoomValidation = () =>
  useBookingStore(
    useShallow((state) => {
      //TODO: This is probably way too complex, and also the variable names are terrible, even after a couple of hours away from the code, i forgot what they were exactly
      const selectedRoomCount = state.selectedRoomCount;
      const adults = state.guestCount.adults;
      const children = state.guestCount.children;
      const selected = state.selectedRoomBookings;

      let totalRoomsSelected = 0;
      let totalCapacitySelected = 0;
      let totalGuestsAssigned = 0;
      const totalGuests = adults + children;

      for (const bookings of Object.values(selected)) {
        totalRoomsSelected += bookings.length;
        for (const b of bookings) {
          totalCapacitySelected += b.capacity;
          totalGuestsAssigned += b.adults + b.children;
        }
      }

      const remainingGuests = totalGuests - totalCapacitySelected;

      const isRoomAmountValid = totalRoomsSelected === selectedRoomCount;
      const isCapcityValid = totalCapacitySelected >= totalGuests;

      return {
        totalRoomsSelected,
        totalRoomsExpected: selectedRoomCount,
        totalCapacitySelected,
        totalGuests,
        remainingGuests,
        totalGuestsAssigned,
        isRoomAmountValid,
        isCapcityValid,
        isValid: isRoomAmountValid && isCapcityValid,
      };
    }),
  );

// Validate if booking is valid, E.G if all guests are assigned to a room
export const useBookingValidation = () =>
  useBookingStore(
    useShallow((state) => {
      //TODO: This is probably way too complex, and also the variable names are terrible, even after a couple of hours away from the code, i forgot what they were exactly
      const adults = state.guestCount.adults;
      const children = state.guestCount.children;
      const selectedRooms = state.selectedRoomBookings;

      const totalGuests = adults + children;
      let childrenAssigned = 0;
      let adultsAssigned = 0;

      let allRoomsHaveAdult = true;

      for (const bookings of Object.values(selectedRooms)) {
        for (const b of bookings) {
          childrenAssigned += b.children;
          adultsAssigned += b.adults;
          if (b.adults <= 0) {
            allRoomsHaveAdult = false;
          }
        }
      }

      const isAllChildrenAssigned = childrenAssigned === children;

      // the reason adultsAssigned can be greater than the adults selected initially. This is because we automatically assign an adult to each room.
      adultsAssigned = Math.min(adultsAssigned, adults);
      const isAllAdultsAssigned = adultsAssigned === adults;

      const totalGuestsAssigned = childrenAssigned + adultsAssigned;
      const remainingGuests = totalGuests - totalGuestsAssigned;
      const allGuestsAssigned = isAllChildrenAssigned && isAllAdultsAssigned;

      const canBook = allGuestsAssigned && allRoomsHaveAdult;

      return {
        canBook,
        children,
        adults,
        adultsAssigned,
        childrenAssigned,
        isAllChildrenAssigned,
        isAllAdultsAssigned,
        totalGuests,
        totalGuestsAssigned,
        remainingGuests,
      };
    }),
  );

export const useCheckInDate = () =>
  useBookingStore((state) => state.checkInDate);

export const useCheckOutDate = () =>
  useBookingStore((state) => state.checkOutDate);

//TODO: does it make sense to make a bigger hook for the breakdown, can we call the atomic hooks inside of it? I'm not sure we can if we are wrapping with useShallow...
const useBookingRaw = () =>
  useBookingStore(
    useShallow((s) => ({
      checkInDate: s.checkInDate,
      checkOutDate: s.checkOutDate,
      selectedRoomBookings: s.selectedRoomBookings,
    })),
  );

export const useBookingBreakdown = (): BookingBreakdown => {
  const { checkInDate, checkOutDate, selectedRoomBookings } = useBookingRaw();

  const { rooms, nights, total } = useMemo(() => {
    const nightsRaw =
      checkInDate && checkOutDate
        ? differenceInDays(checkOutDate, checkInDate)
        : 0;
    const nights = Math.max(0, nightsRaw || 0);

    const rooms = CONSTANTS.ROOM_TYPES.map((roomType) => {
      const bookings = selectedRoomBookings[roomType] ?? [];
      const amountOfBookings = bookings.length;
      if (amountOfBookings === 0) return null;

      const sumPerNight = bookings.reduce(
        (acc, b) => acc + (Number(b?.pricePerNight) || 0),
        0,
      );

      const pricePerNight =
        amountOfBookings > 0 ? sumPerNight / amountOfBookings : 0;

      const totalPerNight = sumPerNight;
      const totalPrice = totalPerNight * nights;

      return {
        type: roomType,
        amountOfBookings,
        pricePerNight,
        totalPerNight,
        totalPrice,
      } as RoomTypeBreakdown;
    }).filter((v): v is RoomTypeBreakdown => v !== null);

    const total = rooms.reduce((acc, r) => acc + r.totalPrice, 0);

    return { rooms, nights, total };
  }, [checkInDate, checkOutDate, selectedRoomBookings]);

  return { rooms, nights, total };
};

export const useSelectedRoomBookings = () =>
  useBookingStore((state) => state.selectedRoomBookings);

export const useGetTotalBookingPrice = () =>
  useBookingStore((state) => {
    return Object.values(state.selectedRoomBookings).reduce(
      (total, bookings) =>
        total + bookings.reduce((acc, booking) => acc + booking.totalPrice, 0),
      0,
    );
  });

export const useGetSelectedRoomBookingsCount = () =>
  useBookingStore((state) => {
    return Object.values(state.selectedRoomBookings).reduce(
      (total, bookings) => total + bookings.length,
      0,
    );
  });

export const useBookingActions = () =>
  useBookingStore((state) => state.actions);
