using API.Models.Entities;

namespace API.Models.Dtos;

public class RoomResponseDto : Entity<Guid>
{
    public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; }
    public short? Floor { get; init; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = false;
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
    public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; }
    public required short Floor { get; set; }
    public string? Description { get; set; }

    public bool isActive { get; set; }
}