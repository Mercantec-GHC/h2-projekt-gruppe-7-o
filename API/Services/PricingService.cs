using API.Models.Dtos;

public interface IPricingService
{
    Task<decimal> CalculateTotalPriceAsync(BookingCreateDto bookingDto);
}

public class PricingService : IPricingService
{
    // Inject dependencies as needed (e.g., room repo, discount service)
    public PricingService( /* ... */)
    {
    }

    public async Task<decimal> CalculateTotalPriceAsync(BookingCreateDto bookingDto)
    {
        //TODO: Get rooms, so we can calculate the total price
        // var rooms = bookingDto.RoomIds;


        // Ensure nights is at least 1
        var nights = Math.Max(1, (bookingDto.CheckOut - bookingDto.CheckIn).Days);

        // Example: calculate price based on dates, room type, guests, etc.
        // get the price per night from the room we fetched from the DB
        decimal pricePerNight = 100; // Fetch from DB based on room type, etc.

        return nights * pricePerNight;
    }
}