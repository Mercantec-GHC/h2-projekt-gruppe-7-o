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

    public static Room ToRoom(this RoomPostDto roomPostDto)
    {
        return new Room
        {
            Number = roomPostDto.Number,
            Capacity = roomPostDto.Capacity,
            PricePerNight = roomPostDto.PricePerNight,
            Type = roomPostDto.Type,
            Description = roomPostDto.Description ?? string.Empty,
            Floor = roomPostDto.Floor,
            isActive = roomPostDto.isActive,
            HotelId = roomPostDto.HotelId,
        };
    }
}