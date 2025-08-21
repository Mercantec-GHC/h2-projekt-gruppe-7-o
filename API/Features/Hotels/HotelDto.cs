using API.Models.Entities;

namespace API.Models.Dtos;

public class HotelResponseDto : Entity<Guid>
{
    public required string Name { get; set; }
    public required string StreetName { get; set; }
    public required string StreetNumber { get; set; }
    public string? Floor { get; set; }
    public required string City { get; set; }
    public required string ZipCode { get; set; }
    public required string Country { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
}

public class HotelWithRoomsDto : HotelResponseDto
{
    public List<Room> Rooms { get; set; } = new List<Room>();
}

public class HotelCreateDto
{
    public required string Name { get; set; }
    public required string StreetName { get; set; }
    public required string StreetNumber { get; set; }
    public string? Floor { get; set; }
    public required string City { get; set; }
    public required string ZipCode { get; set; }
    public required string Country { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
}

public sealed class HotelUpdateDto : HotelCreateDto
{
}