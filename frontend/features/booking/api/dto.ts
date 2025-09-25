export interface RoomTypesAvailablityResponseDto {
  roomTypeAvailabilities: { type: number; availableRoomsCount: number }[];
}

export interface RoomTypesAvailablityRequestDto {
  hotelId?: string;
  checkIn?: string;
  checkOut?: string;
}

export enum RoomType {
  STANDARD = 0,
  DELUXE = 1,
  SUITE = 2,
  FAMILIA = 3,
}
