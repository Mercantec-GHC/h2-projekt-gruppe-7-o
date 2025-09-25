using API.Models.Entities;

namespace API.Models.Dtos;

public class RoomResponseDto
{
    public Guid Id { get; set; }
    public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; }
    public short? Floor { get; init; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = false;

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class RoomTypeAvailability
{
    public RoomType Type { get; set; }
    public int AvailableRoomsCount { get; set; }
}

public class RoomTypesAvailablityResponseDto
{
    public IEnumerable<RoomTypeAvailability> RoomTypeAvailabilities { get; set; } = new List<RoomTypeAvailability>();
}

public sealed class RoomWithBookingsDto : RoomResponseDto
{
    public List<BookingResponseDto> Bookings { get; set; } = new List<BookingResponseDto>();
}

public sealed class RoomCreateDto
{
    public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; }
    public required short Floor { get; set; }
    public string? Description { get; set; }

    public bool IsActive { get; set; }
    public Guid HotelId { get; set; }
}

public sealed class RoomUpdateDto
{
    public required string Number { get; set; } = string.Empty;
    public required short Capacity { get; set; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; }
    public required short Floor { get; set; }
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}

public class AvailabilityResponseDto
{
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public IEnumerable<RoomResponseDto> Rooms { get; set; } = new List<RoomResponseDto>();
}