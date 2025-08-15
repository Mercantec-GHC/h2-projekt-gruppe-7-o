using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;

namespace API.Services;

public interface IBookingService
{
    Task<Booking> CreateBookingAsync(BookingCreateDto dto);
}

public class BookingService : IBookingService
{
    private readonly IPricingService _pricingService;
    private readonly AppDBContext _dbContext;

    public BookingService(IPricingService pricingService, AppDBContext dbContext)
    {
        _pricingService = pricingService;
        _dbContext = dbContext;
    }

    public async Task<Booking> CreateBookingAsync(BookingCreateDto dto)
    {
        // 1. Calculate total price
        decimal totalPrice = await _pricingService.CalculateTotalPriceAsync(dto);

        // 2. Map DTO to Entity
        Booking booking = dto.ToBooking(totalPrice);

        // 3. Optionally, set other properties or validate

        // 4. Save to DB
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        return booking;
    }
}