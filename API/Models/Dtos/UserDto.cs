namespace API.Models.Dtos;

public class UserDto
{
    public required Guid Id { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string RoleName { get; set; }
    // public List<Booking> Bookings { get; set; } = new List<Booking>();
    // public Guid RoleId { get; set; }
}