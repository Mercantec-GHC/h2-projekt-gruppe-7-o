using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace API.Models.Entities;

[Index(nameof(Number), IsUnique = true)]
public class Room : Entity<Guid>
{
    [StringLength(32)] public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; } = RoomType.Standard;
    public short? Floor { get; init; }
    public string? Description { get; set; }
    public bool isActive { get; set; } = false;

    public ICollection<Booking> Bookings { get; init; } = new List<Booking>();
}

public enum RoomType
{
    Standard,
    Deluxe,
    Suite
}