import { UserDto } from "@/features/user/api/dto";
import { RoomBooking, RoomBookingAddon as RoomBookingAddon } from "../domain";

export type RoomType = "Standard" | "Deluxe" | "Suite" | "Family";

export type BookingStatus = "Pending" | "Confirmed" | "Cancelled";

export interface RoomTypesAvailablityResponseDto {
  roomTypeAvailabilities: {
    type: RoomType;
    capacity: number;
    roomDescription: string;
    roomImageUrl: string;
    pricePerNight: number;
    totalPrice: number;
    availableRoomsCount: number;
  }[];
}

export interface RoomBookingRequestDto {
  //TODO: the backend currently expects a number, but should receive a string of RoomType?
  roomType: number;
  // roomType: RoomType;
  adults: number;
  children: number;
  addons: RoomBookingAddon[];
}

export interface CreateBookingRequestDto {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  roomBookings: RoomBookingRequestDto[];
}

export interface CreateBookingResponseDto {
  bookingId: string;
}

export interface RoomTypesAvailablityRequestDto {
  hotelId?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface RoomDto {
  id: string;
  number: number;
  capacity: number;
  type: RoomType;
  floor: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDto {
  id: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: BookingStatus;
  user: UserDto;
  rooms: RoomDto[];
  createdAt: string;
  updatedAt: string;
}
