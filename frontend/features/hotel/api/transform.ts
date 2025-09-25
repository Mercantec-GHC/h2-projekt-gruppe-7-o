import { Hotel } from "../domain";
import { HotelResponseDto } from "./dto";

export function dtoToHotel(dto: HotelResponseDto): Hotel {
  return {
    id: dto.id,
    name: dto.name,
    streetName: dto.streetName,
    streetNumber: dto.streetNumber,
    floor: dto.floor,
    city: dto.city,
    zipCode: dto.zipCode,
    country: dto.country,
    email: dto.email,
    phoneNumber: dto.phoneNumber,
  };
}
