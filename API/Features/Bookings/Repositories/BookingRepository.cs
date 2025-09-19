using API.Data;
using API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

internal sealed class BookingRepository(AppDBContext context) : IBookingRepository
{
    private readonly AppDBContext _context = context;

    public async Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct = default)
    {
        var bookings = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.Rooms)
            .ToListAsync(ct);

        return bookings;
    }

    public async Task<Booking?> GetBookingByIdAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _context.Bookings.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken: ct);
        return booking;
    }

    public Task<Booking> CreateAsync(Booking entity, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task DeleteByIdAsync(Guid id, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public async Task<List<Room>> GetRoomsByIdsAsync(List<Guid> roomIds, CancellationToken ct = default)
    {
        return await _context.Rooms
            .Where(r => roomIds.Contains(r.Id))
            .ToListAsync(ct);
    }

    public async Task<List<Booking>> GetOverlappingBookingsAsync(List<Guid> roomIds, DateTime checkIn, DateTime checkOut, CancellationToken ct = default)
    {
        // Konverter til UTC
        var startUtc = checkIn.Kind == DateTimeKind.Utc ? checkIn : checkIn.ToUniversalTime();
        var endUtc = checkOut.Kind == DateTimeKind.Utc ? checkOut : checkOut.ToUniversalTime();
        return await _context.Bookings
            .Include(b => b.Rooms)
            .Where(b =>
                b.Status != BookingStatus.Cancelled &&
                b.CheckIn < endUtc &&
                b.CheckOut > startUtc &&
                b.Rooms.Any(r => roomIds.Contains(r.Id)))
            .ToListAsync(ct);
    }
}