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

    public async Task<Booking> CreateAsync(Booking entity, CancellationToken ct = default)
    {
        _context.Bookings.Add(entity);
        await _context.SaveChangesAsync(ct);
        return entity;
    }

    public async Task DeleteByIdAsync(Guid id, CancellationToken ct = default)
    {
        var booking = await _context.Bookings.FindAsync(new object[] { id }, ct);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync(ct);
        }
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

    public async Task<Room?> GetAvailableRoomByTypeAsync(RoomType roomType, DateTime checkIn, DateTime checkOut, Guid? hotelId)
    {
        var query = _context.Rooms
            .Where(r => r.Type == roomType);

        if (hotelId.HasValue)
        {
            query = query.Where(r => r.HotelId == hotelId.Value);
        }

        var availableRoom = await query
            .Where(r => !r.Bookings.Any(b =>
                b.Status != BookingStatus.Cancelled &&
                b.CheckIn < checkOut &&
                b.CheckOut > checkIn))
            .FirstOrDefaultAsync();

        return availableRoom;
    }
}