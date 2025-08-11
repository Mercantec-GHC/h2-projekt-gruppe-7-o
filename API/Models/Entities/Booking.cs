namespace API.Models.Entities;

public class Booking : Common
{
    // public Guid RoomId { get; set; }
    // public Guid UserId { get; set; }
    public required DateTime CheckIn { get; set; }
    public required DateTime CheckOut { get; set; }
    public required short Adults { get; set; }
    public required short Children { get; set; }
    public required decimal TotalPrice { get; set; }
    public required BookingStatus Status { get; set; } = BookingStatus.Pending;

    public User User { get; set; }
    public ICollection<Room> Rooms { get; set; }
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled
}