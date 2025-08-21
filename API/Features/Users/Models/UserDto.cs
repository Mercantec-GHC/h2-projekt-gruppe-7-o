using API.Models.Entities;

namespace API.Models.Dtos;

public class UserReponseDto : Entity<Guid>
{
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string RoleName { get; set; }
}

public class UserWithBookingsDto : UserReponseDto
{
    public List<Booking> Bookings { get; set; } = new List<Booking>();
}

//TODO: Add another dto for changing email, and not just basic user info
public class UserUpdateDto
{
    public string? Phone { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? RoleId { get; set; }
}