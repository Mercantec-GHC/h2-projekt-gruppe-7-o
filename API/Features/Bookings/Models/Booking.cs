using NpgsqlTypes;

namespace API.Models.Entities;

public class Booking : Entity<Guid>
{
    public required DateTime CheckIn { get; set; }
    public required DateTime CheckOut { get; set; }
    public required short Adults { get; set; }
    public required short Children { get; set; }
    public required BookingStatus Status { get; set; } = BookingStatus.Pending;

    public required decimal TotalPrice { get; set; }
    public Guid UserId { get; init; }
    public User User { get; init; }

    public List<BookingLine> BookingLines { get; set; } = new List<BookingLine>();
    public ICollection<Room> Rooms { get; set; } = new List<Room>();

}

// TODO: do we need to add a active and done status?
public enum BookingStatus
{
    [PgName("pending")] Pending,
    [PgName("confirmed")] Confirmed,
    [PgName("cancelled")] Cancelled
}