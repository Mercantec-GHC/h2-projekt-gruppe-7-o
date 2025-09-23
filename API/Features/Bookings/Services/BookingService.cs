using API.Mapping;
using API.Models.Dtos;
using API.Models.Entities;
using API.Repositories;

namespace API.Features.Bookings.Services;

public class BookingService
{
    private readonly IBookingRepository _repository;
    private readonly ILogger<BookingService> _logger;

    public BookingService(IBookingRepository repository, ILogger<BookingService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Guid> CreateBookingAsync(BookingCreateDto dto, Guid userId)
    {
        if (dto.CheckOut <= dto.CheckIn)
            throw new InvalidOperationException("Check-out must be after check-in");

        var rooms = await _repository.GetRoomsByIdsAsync(dto.RoomIds);
        if (rooms.Count != dto.RoomIds.Count)
            throw new InvalidOperationException("Some rooms do not exist");

        var overlapping = await _repository.GetOverlappingBookingsAsync(dto.RoomIds, dto.CheckIn, dto.CheckOut);
        if (overlapping.Any())
            throw new InvalidOperationException("Rooms not available");

        var nights = (dto.CheckOut.Date - dto.CheckIn.Date).Days;
        if (nights <= 0) nights = 1;

        var booking = dto.ToBooking(userId, rooms);

        foreach (var room in rooms)
        {
            booking.BookingLines.Add(new BookingLine
            {
                Type = BookingLineType.Room,
                BookingId = booking.Id,
                RoomId = room.Id,
                Booking = booking,
                Amount = room.PricePerNight * nights,
                Status = BookingLineStatus.Unpaid,
                CreatedBy = userId,
                UpdatedBy = userId
            });
        }

        await _repository.CreateAsync(booking);


        _logger.LogInformation("Booking {BookingId} created by user {UserId}", booking.Id, userId);
        return booking.Id;
    }
}
