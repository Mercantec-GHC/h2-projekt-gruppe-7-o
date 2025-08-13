namespace API.Models.Entities;

public class Booking : Entity<Guid>
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public required short Adults { get; init; }
    public required short Children { get; init; }
    public required decimal TotalPrice { get; init; }
    public required BookingStatus Status { get; set; } = BookingStatus.Pending;

    public User User { get; init; }
    public ICollection<Room> Rooms { get; init; } = new List<Room>();
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled
}