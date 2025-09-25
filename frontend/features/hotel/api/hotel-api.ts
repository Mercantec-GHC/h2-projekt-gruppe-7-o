import { apiClient } from "@/api/client";
import { Hotel } from "../domain";
import { dtoToHotel } from "./transform";
import { HotelResponseDto } from "./dto";

async function getHotels(): Promise<Hotel[]> {
  const res = await apiClient.get<HotelResponseDto[]>("/hotels");
  const hotels = res.data.map((hotelResponseDto) =>
    dtoToHotel(hotelResponseDto),
  );
  return hotels;
}

async function getHotel(id: string): Promise<Hotel> {
  const res = await apiClient.get<HotelResponseDto>(`/hotels/${id}`);
  const hotelDto = res.data;
  return dtoToHotel(hotelDto);
}

export default { getHotels, getHotel };
