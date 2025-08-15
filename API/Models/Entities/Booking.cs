namespace API.Models.Entities;

public class Booking : Entity<Guid>
{
    public required DateTime CheckIn { get; init; }
    public required DateTime CheckOut { get; init; }
    public required short Adults { get; init; }
    public required short Children { get; init; }

    public required decimal TotalPrice { get; set; }
    public required BookingStatus Status { get; set; } = BookingStatus.Pending;

    public Guid UserId { get; init; }
    public User User { get; init; }
    public Guid RoomId { get; set; }
    public ICollection<Room> Rooms { get; init; } = new List<Room>();

    private int Nights => (CheckOut - CheckIn).Days == 0 ? 1 : (CheckOut - CheckIn).Days;

    //TODO: Might want to move this to a service instead, if we want to be able to change the price with discounts or seasonal prices etc.
    //TODO: We have a flaw here, because what happens if the room price changes? This is hard coupled to the room, which means that if someone were to change the room price, this total price would be updated as well.
    // Idea to fix the above, calculate the total price on the fly initially, and then store it in the database? This is a case where I think that a computed value still makes sense, even though it usually breaks the first normal form
    // We need to create services (PricingService, BookingService, etc.)
    public decimal CalculateTotalPrice()
    {
        var totalPrice = 0m;
        foreach (var room in Rooms)
        {
            totalPrice += room.PricePerNight * Nights;
        }

        return totalPrice;
    }
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled
}