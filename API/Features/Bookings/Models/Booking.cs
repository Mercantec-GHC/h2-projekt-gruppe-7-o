using NpgsqlTypes;

namespace API.Models.Entities;

public class Booking : Entity<Guid>
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public required short Adults { get; init; }
    public required short Children { get; init; }
    public required BookingStatus Status { get; set; } = BookingStatus.Pending;

    public Guid UserId { get; init; }
    public User User { get; init; }

    public List<BookingLine> BookingLines { get; init; } = new List<BookingLine>();
    public ICollection<Room> Rooms { get; init; } = new List<Room>();

    private int Nights => (CheckOut - CheckIn).Days == 0 ? 1 : (CheckOut - CheckIn).Days;
}

// TODO: do we need to add a active and done status?
public enum BookingStatus
{
    [PgName("pending")] Pending,
    [PgName("confirmed")] Confirmed,
    [PgName("cancelled")] Cancelled
}