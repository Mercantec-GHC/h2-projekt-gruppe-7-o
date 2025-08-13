using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace API.Models.Entities;

[Index(nameof(Email), nameof(Phone), IsUnique = true)]
public class User : Common
{
    public required string Email { get; set; }

    [StringLength(32)] public string? Phone { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string HashedPassword { get; set; }
    public required string Salt { get; set; }
    public DateTime LastLogin { get; set; }

    // Only for educational purposses, not in the final product!
    // Used to display how hasing with salt works
    public string PasswordBackdoor { get; set; }

    // FK + navigation til rolle (én rolle pr. bruger)
    public Guid RoleId { get; set; } = default!;  // navigation 
    public Role Role { get; set; } = default!;


    public ICollection<Booking> Bookings { get; init; }
}