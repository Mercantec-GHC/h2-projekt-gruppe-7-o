using API.Models.Dtos;
using API.Models.Entities;

namespace API.Mapping;

public static class RoomMapping
{
    public static RoomResponseDto ToRoomDto(this Room room)
    {
        return new RoomResponseDto
        {
            Id = room.Id,
            Number = room.Number,
            Capacity = room.Capacity,
            PricePerNight = room.PricePerNight,
            Type = room.Type.ToString(),
            Floor = room.Floor,
            Description = room.Description,
            ImageUrl = room.ImageUrl,
            IsActive = room.IsActive,
            CreatedAt = room.CreatedAt,
            UpdatedAt = room.UpdatedAt
        };
    }

    public static RoomWithBookingsDto ToRoomWithBookingsDto(this Room room)
    {
        return new RoomWithBookingsDto
        {
            Id = room.Id,
            Number = room.Number,
            Capacity = room.Capacity,
            PricePerNight = room.PricePerNight,
            Type = room.Type.ToString(),
            Floor = room.Floor,
            Description = room.Description,
            ImageUrl = room.ImageUrl,
            IsActive = room.IsActive,
            CreatedAt = room.CreatedAt,
            UpdatedAt = room.UpdatedAt,
            Bookings = room.Bookings.Select(b => b.ToBookingDto()).ToList()
        };
    }

    public static Room ToRoom(this RoomCreateDto dto)
    {
        return new Room
        {
            Number = dto.Number,
            Capacity = dto.Capacity,
            PricePerNight = dto.PricePerNight,
            Type = dto.Type,
            Floor = dto.Floor,
            Description = dto.Description ?? string.Empty,
            IsActive = dto.IsActive,
            HotelId = dto.HotelId
        };
    }

    public static void UpdateRoom(this Room room, RoomUpdateDto dto)
    {
        room.Number = dto.Number;
        room.Capacity = dto.Capacity;
        room.PricePerNight = dto.PricePerNight;
        room.Type = dto.Type;
        room.Floor = dto.Floor;
        room.Description = dto.Description ?? string.Empty;
        room.IsActive = dto.IsActive;
        room.UpdatedAt = DateTimeOffset.UtcNow;
    }
}