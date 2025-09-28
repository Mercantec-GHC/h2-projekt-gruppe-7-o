import { BookingDto } from "@/features/booking/api/dto";

export interface UserDto {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeResponseDto extends UserDto {
  bookings: BookingDto[];
}
