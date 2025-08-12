using Microsoft.EntityFrameworkCore;

namespace API.Models.Entities;

[Index(nameof(Number), IsUnique = true)]
public class Room : Common
{
    public required string Number { get; set; }
    public required short Capacity { get; set; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; } = RoomType.Standard;
    public short? Floor { get; set; }
    public string? Description { get; set; }
    public bool isActive { get; set; } = false;

    public ICollection<Booking> Bookings { get; set; }
}

public enum RoomType
{
    Standard,
    Deluxe,
    Suite
}