using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;

namespace API.Models.Entities;

[Index(nameof(Number), IsUnique = true)]
public class Room : Entity<Guid>
{
    [StringLength(32)] public required string Number { get; init; }
    public required short Capacity { get; init; }
    public required decimal PricePerNight { get; set; }
    public required RoomType Type { get; set; } = RoomType.Standard;
    public required short Floor { get; init; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = false;


    public required Guid HotelId { get; set; }

    public Hotel? Hotel { get; init; }

    public ICollection<Booking> Bookings { get; init; } = new List<Booking>();
}

public enum RoomType
{
    [PgName("standard")] Standard,

    [PgName("deluxe")] Deluxe,

    [PgName("suite")] Suite
}