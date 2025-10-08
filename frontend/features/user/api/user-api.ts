import { apiClient } from "@/api/client";
import { MeResponseDto, UserDto } from "./dto";
import { dtoToUser } from "./transform";
import { User } from "../domain";
import { BookingDto } from "@/features/booking/api/dto";

// TODO: How do we fetch and handle errors in the best way? Look at others implementations
async function getMe() {
  const res = await apiClient.get<MeResponseDto>(`/users/me`);

  const meResponseDto = res.data;
  return meResponseDto;
}

async function getUser(id: string): Promise<User> {
  const res = await apiClient.get<UserDto>(`/users/${id}`);
  const userDto = res.data;
  return dtoToUser(userDto);
}

async function getUsers(): Promise<User[]> {
  const res = await apiClient.get<UserDto[]>(`/users`);
  const users = res.data.map(dtoToUser);
  return users;
}

async function getBookings(): Promise<BookingDto[]> {
  const res = await apiClient.get<BookingDto[]>(`/users/me/bookings`);
  return res.data;
}

export default { getBookings, getMe, getUser, getUsers };
