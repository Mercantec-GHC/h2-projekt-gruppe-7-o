namespace API.Models.Entities;

public class BookingLine : Entity<Guid>
{
    public required BookingLineType Type { get; set; }
    public string? Description { get; set; }
    public required decimal Amount { get; set; }

    public required BookingLineStatus Status { get; set; }

    public required Guid BookingId { get; set; }

    public required Booking Booking { get; set; }

    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }

    // TODO: This should either be a user or the system that created the booking. Is it normal to create a system user?
    public required Guid CreatedBy { get; set; }
    public required Guid UpdatedBy { get; set; }
}

public enum BookingLineType
{
    Room,
    Addon,
    Fee,
    Discount,
    RoomService
}

public enum BookingLineStatus
{
    Paid,
    Unpaid,
    Refunded,
    Cancelled,
}