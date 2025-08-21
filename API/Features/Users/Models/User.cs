using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace API.Models.Entities;

[Index(nameof(Email), nameof(Phone), IsUnique = true)]
public class User : Entity<Guid>
{
    public required string Email { get; set; }

    [StringLength(32)] public string? Phone { get; set; }
    [StringLength(255)] public required string FirstName { get; set; }
    [StringLength(255)] public required string LastName { get; set; }

    public required string HashedPassword { get; set; }

    public DateTimeOffset? LastLogin { get; set; }

    // Explicit FK to Role (guid assumed from Entity.Id)
    public int RoleId { get; set; }


    // Navigation to principal
    public Role Role { get; set; } = null!;

    public List<Booking> Bookings { get; init; } = new List<Booking>();
    public List<BookingLine> BookingLines { get; init; } = new List<BookingLine>();
}