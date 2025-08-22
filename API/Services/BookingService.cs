using API.Data;
using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

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
        if (dto.RoomIds != null && dto.RoomIds.Any())
        {
            bool available = await AreRoomsAvailable(dto.RoomIds, dto.CheckIn, dto.CheckOut);
            if (!available)
                throw new InvalidOperationException("One or more rooms are already booked for the selected period.");
        }


        // 1. Calculate total price
        decimal totalPrice = await _pricingService.CalculateTotalPriceAsync(dto);

        // 2. Map DTO to Entity
        List<Room> rooms = new();
        if (dto.RoomIds != null && dto.RoomIds.Any())
        {
            rooms = await _dbContext.Rooms
                .Where(r => dto.RoomIds.Contains(r.Id))
                .ToListAsync();
        }

        var booking = new Booking
        {
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Adults = dto.Adults,
            Children = dto.Children,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending,
            Rooms = rooms
        };

        // 4. Save to DB
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        return booking;
    }
    private async Task<bool> AreRoomsAvailable(List<Guid> roomIds, DateTime checkIn, DateTime checkOut)
    {
        return !await _dbContext.Bookings
            .Where(b => b.Rooms.Any(r => roomIds.Contains(r.Id)) &&
                        ((b.CheckIn < checkOut && b.CheckOut > checkIn) || // Overlapping bookings
                         (b.CheckIn == checkIn && b.CheckOut == checkOut))) // Exact match
            .AnyAsync();
    }
}