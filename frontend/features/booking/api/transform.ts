import { RoomTypeAvailability } from "../domain";
import { RoomType, RoomTypesAvailablityResponseDto } from "./dto";

export function roomTypeAvailabilityDtoToRoomTypeAvailability(
  roomTypeAvailabilityDto: RoomTypesAvailablityResponseDto,
): RoomTypeAvailability[] {
  const roomTypeAvailability =
    roomTypeAvailabilityDto.roomTypeAvailabilities.map(
      (roomTypeAvailability) => ({
        type: mapRoomTypeToEnum(roomTypeAvailability.type),
        availableRoomsCount: roomTypeAvailability.availableRoomsCount,
      }),
      //TODO: prevent type casting here
    ) as RoomTypeAvailability[];

  return roomTypeAvailability;
}

function mapRoomTypeToEnum(roomType: number): RoomType {
  switch (roomType) {
    case 0:
      return RoomType.STANDARD;
    case 1:
      return RoomType.DELUXE;
    case 2:
      return RoomType.SUITE;
    case 3:
      return RoomType.FAMILIA;
    default:
      throw new Error(`Invalid room type: ${roomType}`);
  }
}
