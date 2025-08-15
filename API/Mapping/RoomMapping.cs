using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class RoomMapping
{
    public static RoomResponseDto ToRoomDto(this Room Room)
    {
        return new RoomResponseDto
        {
            Id = Room.Id,
            CreatedAt = Room.CreatedAt,
            UpdatedAt = Room.UpdatedAt,
            Number = Room.Number,
            Capacity = Room.Capacity,
            PricePerNight = Room.PricePerNight,
            Type = RoomType.Standard
        };
    }

    public static RoomWithBookingsDto ToRoomWithBookingsDto(this Room Room)
    {
        return new RoomWithBookingsDto
        {
            Id = Room.Id,
            CreatedAt = Room.CreatedAt,
            UpdatedAt = Room.UpdatedAt,
            Number = Room.Number,
            Capacity = Room.Capacity,
            PricePerNight = Room.PricePerNight,
            Type = Room.Type,
            Description = Room.Description,
            Floor = Room.Floor,
            isActive = Room.isActive,
        };
    }

    public static Room ToRoom(this RoomCreateDto roomCreateDto)
    {
        return new Room
        {
            Number = roomCreateDto.Number,
            Capacity = roomCreateDto.Capacity,
            PricePerNight = roomCreateDto.PricePerNight,
            Type = roomCreateDto.Type,
            Description = roomCreateDto.Description ?? string.Empty,
            Floor = roomCreateDto.Floor,
            isActive = roomCreateDto.isActive,
            HotelId = roomCreateDto.HotelId,
        };
    }
}