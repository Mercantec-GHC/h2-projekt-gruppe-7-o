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
}